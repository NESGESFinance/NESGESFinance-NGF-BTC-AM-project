pub mod bitcoin;

use axum::{
    Json, Router,
    extract::{Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use futures_util::{SinkExt, StreamExt};
use reqwest::{Client, Url, header::ACCEPT};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{env, sync::Arc, time::Duration};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as TungsteniteMessage};
use tracing::warn;

const TREASURY_ADDRESS: &str = "bc1pl8qtw4g9afscmctydmv56mak4m9leqxyqlvqgxaltj2d5wt9wteqqgpdug";
const DEFAULT_MEMPOOL_REST_BASE_URL: &str = "https://mempool.space/api";
const DEFAULT_MEMPOOL_WS_URL: &str = "wss://mempool.space/api/v1/ws";
const DEFAULT_ORD_BASE_URL: &str = "https://ordinals.com";
const NGF_RUNE_NAME: &str = "NGF•BTC•AM";
const NGF_RUNE_NUMBER: u64 = 208_645;
const NGF_RUNE_ID: &str = "923867:120";
const NGF_ETCHING_TXID: &str = "4c0b2416f3dd122025f89a62d7ff265fcee8d00e0fabd874669617cf85437c82";
const NGF_ETCHING_BLOCK: u64 = 923_867;
const NGF_DECLARED_TIMESTAMP: &str = "2025-11-16T05:24:23Z";

#[derive(Clone)]
pub struct AppState {
    treasury_address: Arc<String>,
    http_client: Client,
    mempool_rest_base_url: Arc<String>,
    mempool_ws_url: Arc<String>,
    ord_base_url: Arc<String>,
}

impl AppState {
    fn from_env() -> Self {
        let http_client = Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .expect("failed to construct HTTP client");

        Self {
            treasury_address: Arc::new(TREASURY_ADDRESS.to_string()),
            http_client,
            mempool_rest_base_url: Arc::new(
                env::var("NESGES_MEMPOOL_REST_BASE_URL")
                    .unwrap_or_else(|_| DEFAULT_MEMPOOL_REST_BASE_URL.to_string())
                    .trim_end_matches('/')
                    .to_string(),
            ),
            mempool_ws_url: Arc::new(
                env::var("NESGES_MEMPOOL_WS_URL")
                    .unwrap_or_else(|_| DEFAULT_MEMPOOL_WS_URL.to_string()),
            ),
            ord_base_url: Arc::new(
                env::var("NESGES_ORD_BASE_URL")
                    .unwrap_or_else(|_| DEFAULT_ORD_BASE_URL.to_string())
                    .trim_end_matches('/')
                    .to_string(),
            ),
        }
    }
}

pub fn app() -> Router {
    let state = AppState::from_env();

    Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/mempool/fees", get(get_mempool_fees))
        .route("/api/v1/mempool/ws", get(mempool_ws_handler))
        .route("/api/v1/inscribe/commit", post(create_commit_tx))
        .route("/api/v1/psbt/validate", post(validate_psbt_handler))
        .route("/api/v1/ngf/validate", get(validate_ngf_handler))
        .with_state(state)
}

async fn health_check() -> &'static str {
    "OK - NESGESFinance API v3.1 Operational"
}

#[derive(Serialize)]
pub struct MempoolFees {
    low_fee: u64,
    medium_fee: u64,
    high_fee: u64,
    block_height: u64,
    source: &'static str,
}

#[derive(Deserialize)]
struct MempoolRecommendedFees {
    #[serde(rename = "fastestFee")]
    fastest_fee: u64,
    #[serde(rename = "halfHourFee")]
    half_hour_fee: u64,
    #[serde(rename = "economyFee")]
    economy_fee: u64,
}

async fn get_mempool_fees(
    State(state): State<AppState>,
) -> Result<Json<MempoolFees>, (StatusCode, Json<Value>)> {
    let fees_url = format!("{}/v1/fees/recommended", state.mempool_rest_base_url);
    let block_height_url = format!("{}/blocks/tip/height", state.mempool_rest_base_url);

    let fees_request = state.http_client.get(fees_url).send();
    let block_height_request = state.http_client.get(block_height_url).send();

    let (fees_response, block_height_response) =
        tokio::try_join!(fees_request, block_height_request).map_err(api_error_from_request)?;

    let fees = fees_response
        .error_for_status()
        .map_err(api_error_from_request)?
        .json::<MempoolRecommendedFees>()
        .await
        .map_err(api_error_from_request)?;

    let block_height = block_height_response
        .error_for_status()
        .map_err(api_error_from_request)?
        .text()
        .await
        .map_err(api_error_from_request)?
        .trim()
        .parse::<u64>()
        .map_err(api_error_from_parse)?;

    Ok(Json(MempoolFees {
        low_fee: fees.economy_fee,
        medium_fee: fees.half_hour_fee,
        high_fee: fees.fastest_fee,
        block_height,
        source: "mempool.space",
    }))
}

async fn mempool_ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        let Ok((remote_stream, _)) = connect_async(state.mempool_ws_url.as_str()).await else {
            warn!("failed to connect to upstream mempool websocket");
            return;
        };

        let (mut client_sender, mut client_receiver) = socket.split();
        let (mut remote_sender, mut remote_receiver) = remote_stream.split();

        if remote_sender
            .send(TungsteniteMessage::Text(
                r#"{"action":"want","data":["blocks","stats","mempool-blocks"]}"#
                    .to_string()
                    .into(),
            ))
            .await
            .is_err()
        {
            warn!("failed to subscribe to upstream mempool websocket");
            return;
        }

        let connected_message = json!({
            "type": "mempool_connected",
            "source": "mempool.space"
        })
        .to_string();

        if client_sender
            .send(axum::extract::ws::Message::Text(connected_message.into()))
            .await
            .is_err()
        {
            return;
        }

        loop {
            tokio::select! {
                upstream = remote_receiver.next() => {
                    match upstream {
                        Some(Ok(TungsteniteMessage::Text(text))) => {
                            if let Some(update) = extract_mempool_ws_update(&text) {
                                match serde_json::to_string(&update) {
                                    Ok(payload) => {
                                        if client_sender.send(axum::extract::ws::Message::Text(payload.into())).await.is_err() {
                                            break;
                                        }
                                    }
                                    Err(error) => warn!(?error, "failed to serialize mempool websocket update"),
                                }
                            }
                        }
                        Some(Ok(TungsteniteMessage::Ping(payload))) => {
                            if remote_sender.send(TungsteniteMessage::Pong(payload)).await.is_err() {
                                break;
                            }
                        }
                        Some(Ok(TungsteniteMessage::Close(_))) | None => break,
                        Some(Ok(_)) => {}
                        Some(Err(error)) => {
                            warn!(?error, "upstream mempool websocket error");
                            break;
                        }
                    }
                }
                downstream = client_receiver.next() => {
                    match downstream {
                        Some(Ok(axum::extract::ws::Message::Close(_))) | None => break,
                        Some(Ok(axum::extract::ws::Message::Ping(payload))) => {
                            if client_sender.send(axum::extract::ws::Message::Pong(payload)).await.is_err() {
                                break;
                            }
                        }
                        Some(Ok(_)) => {}
                        Some(Err(error)) => {
                            warn!(?error, "client websocket error");
                            break;
                        }
                    }
                }
            }
        }
    })
}

#[derive(Debug, Serialize, Default)]
struct MempoolWsUpdate {
    #[serde(rename = "type")]
    event_type: &'static str,
    source: &'static str,
    block_height: Option<u64>,
    low_fee: Option<u64>,
    medium_fee: Option<u64>,
    high_fee: Option<u64>,
}

fn extract_mempool_ws_update(message: &str) -> Option<MempoolWsUpdate> {
    let payload: Value = serde_json::from_str(message).ok()?;
    let mut update = MempoolWsUpdate {
        event_type: "mempool_update",
        source: "mempool.space",
        ..MempoolWsUpdate::default()
    };

    if let Some(block_height) = payload
        .get("block")
        .and_then(|block| block.get("height"))
        .and_then(Value::as_u64)
        .or_else(|| {
            payload
                .get("blocks")
                .and_then(Value::as_array)
                .and_then(|blocks| blocks.first())
                .and_then(|block| block.get("height"))
                .and_then(Value::as_u64)
        })
    {
        update.block_height = Some(block_height);
    }

    if let Some(fees) = payload.get("fees") {
        update.low_fee = fees.get("economyFee").and_then(Value::as_u64);
        update.medium_fee = fees.get("halfHourFee").and_then(Value::as_u64);
        update.high_fee = fees.get("fastestFee").and_then(Value::as_u64);
    }

    if update.block_height.is_some()
        || update.low_fee.is_some()
        || update.medium_fee.is_some()
        || update.high_fee.is_some()
    {
        Some(update)
    } else {
        None
    }
}

#[derive(Deserialize)]
pub struct CommitRequest {
    project_name: String,
    jurisdiction: String,
    contract_hash: String,
}

#[derive(Serialize)]
pub struct CommitResponse {
    commit_txid: String,
    taproot_address: String,
    commit_script_hint: String,
    metadata_jsonld: serde_json::Value,
}

async fn create_commit_tx(Json(payload): Json<CommitRequest>) -> Json<CommitResponse> {
    Json(CommitResponse {
        commit_txid: format!("commit_tx_{}", payload.contract_hash),
        taproot_address: "bc1p8m5p10z8q7w6e5r4t3y2u1v0w9x8y7z6a5b4c3".to_string(),
        commit_script_hint: "Taproot Commit/Reveal (BIP 341/342)".to_string(),
        metadata_jsonld: serde_json::json!({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": payload.project_name,
            "jurisdiction": payload.jurisdiction,
            "provider": "NESGESFinance",
            "isPartOf": "NESGESFinance.app",
            "identifier": {
                "rune": "NGF•BTC•AM",
                "network": "Bitcoin L1",
                "flow": "Commit/Reveal"
            },
            "contract_hash": payload.contract_hash,
        }),
    })
}

#[derive(Deserialize)]
pub struct PsbtValidationReq {
    psbt_hex: String,
    price_sats: u64,
}

#[derive(Serialize)]
pub struct PsbtValidationRes {
    is_valid: bool,
    price_sats: u64,
    treasury_fee_sats: u64,
    sighash_type: String,
    treasury_address: String,
}

async fn validate_psbt_handler(
    State(state): State<AppState>,
    Json(payload): Json<PsbtValidationReq>,
) -> Result<Json<PsbtValidationRes>, (StatusCode, Json<Value>)> {
    match bitcoin::psbt::verify_marketplace_psbt(
        &payload.psbt_hex,
        payload.price_sats,
        &state.treasury_address,
    ) {
        Ok(verification) => Ok(Json(PsbtValidationRes {
            is_valid: verification.is_valid,
            price_sats: verification.price_sats,
            treasury_fee_sats: verification.treasury_fee_sats,
            sighash_type: verification.sighash_type,
            treasury_address: state.treasury_address.as_ref().clone(),
        })),
        Err(error) => Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": error.to_string(),
                "treasury_address": state.treasury_address.as_ref().clone(),
            })),
        )),
    }
}

#[derive(Deserialize)]
struct NgfValidationQuery {
    address: Option<String>,
}

#[derive(Serialize)]
struct NgfValidationResponse {
    is_valid: bool,
    source_of_truth: &'static str,
    declared: DeclaredNgfState,
    mempool: MempoolTxValidation,
    rune_index: RuneIndexValidation,
    address_balance: Option<AddressBalanceValidation>,
    warnings: Vec<String>,
}

#[derive(Serialize)]
struct DeclaredNgfState {
    rune_name: &'static str,
    rune_number: u64,
    rune_id: &'static str,
    etching_txid: &'static str,
    etching_block: u64,
    declared_timestamp: &'static str,
}

#[derive(Serialize)]
struct MempoolTxValidation {
    source: &'static str,
    tx_confirmed: bool,
    block_height_matches: bool,
    block_hash: Option<String>,
    block_height: Option<u64>,
    block_timestamp: Option<u64>,
}

#[derive(Serialize)]
struct RuneIndexValidation {
    source: String,
    provider_available: bool,
    rune_name_matches: bool,
    rune_number_matches: bool,
    rune_id_matches: bool,
    etching_txid_matches: bool,
}

#[derive(Serialize)]
struct AddressBalanceValidation {
    source: String,
    address: String,
    ngf_balance: Option<String>,
    has_required_balance: bool,
}

#[derive(Deserialize)]
struct MempoolTransactionStatus {
    confirmed: bool,
    block_height: Option<u64>,
    block_hash: Option<String>,
    block_time: Option<u64>,
}

#[derive(Deserialize)]
struct MempoolTransaction {
    status: MempoolTransactionStatus,
}

#[derive(Deserialize)]
struct MempoolBlock {
    height: u64,
    timestamp: u64,
}

async fn validate_ngf_handler(
    State(state): State<AppState>,
    Query(query): Query<NgfValidationQuery>,
) -> Result<Json<NgfValidationResponse>, (StatusCode, Json<Value>)> {
    let tx_url = format!("{}/tx/{}", state.mempool_rest_base_url, NGF_ETCHING_TXID);
    let tx = state
        .http_client
        .get(tx_url)
        .send()
        .await
        .map_err(api_error_from_request)?
        .error_for_status()
        .map_err(api_error_from_request)?
        .json::<MempoolTransaction>()
        .await
        .map_err(api_error_from_request)?;

    let block = if let Some(block_hash) = tx.status.block_hash.clone() {
        let block_url = format!("{}/block/{}", state.mempool_rest_base_url, block_hash);
        Some(
            state
                .http_client
                .get(block_url)
                .send()
                .await
                .map_err(api_error_from_request)?
                .error_for_status()
                .map_err(api_error_from_request)?
                .json::<MempoolBlock>()
                .await
                .map_err(api_error_from_request)?,
        )
    } else {
        None
    };

    let mut warnings = Vec::new();
    let rune_index = match fetch_rune_index_validation(&state).await {
        Ok(validation) => validation,
        Err(error) => {
            warnings.push(format!(
                "Rune index provider unavailable: {error}. Configure NESGES_ORD_BASE_URL to a JSON-capable ord endpoint if needed."
            ));
            RuneIndexValidation {
                source: state.ord_base_url.as_ref().clone(),
                provider_available: false,
                rune_name_matches: false,
                rune_number_matches: false,
                rune_id_matches: false,
                etching_txid_matches: false,
            }
        }
    };

    let address_balance = if let Some(address) = query.address {
        match fetch_address_balance_validation(&state, &address).await {
            Ok(balance) => Some(balance),
            Err(error) => {
                warnings.push(format!(
                    "Address balance could not be verified for {address}: {error}"
                ));
                Some(AddressBalanceValidation {
                    source: state.ord_base_url.as_ref().clone(),
                    address,
                    ngf_balance: None,
                    has_required_balance: false,
                })
            }
        }
    } else {
        None
    };

    let mempool = MempoolTxValidation {
        source: "mempool.space",
        tx_confirmed: tx.status.confirmed,
        block_height_matches: tx.status.block_height == Some(NGF_ETCHING_BLOCK),
        block_hash: tx.status.block_hash,
        block_height: tx.status.block_height,
        block_timestamp: block
            .as_ref()
            .map(|item| item.timestamp)
            .or(tx.status.block_time),
    };

    if let Some(block) = &block {
        if block.height != NGF_ETCHING_BLOCK {
            warnings.push(format!(
                "Block endpoint height {} differs from declared etching block {}.",
                block.height, NGF_ETCHING_BLOCK
            ));
        }
    }

    let is_valid = mempool.tx_confirmed
        && mempool.block_height_matches
        && rune_index.provider_available
        && rune_index.rune_name_matches
        && rune_index.rune_number_matches
        && rune_index.rune_id_matches
        && rune_index.etching_txid_matches;

    Ok(Json(NgfValidationResponse {
        is_valid,
        source_of_truth: "Bitcoin L1 + Rune indexer",
        declared: DeclaredNgfState {
            rune_name: NGF_RUNE_NAME,
            rune_number: NGF_RUNE_NUMBER,
            rune_id: NGF_RUNE_ID,
            etching_txid: NGF_ETCHING_TXID,
            etching_block: NGF_ETCHING_BLOCK,
            declared_timestamp: NGF_DECLARED_TIMESTAMP,
        },
        mempool,
        rune_index,
        address_balance,
        warnings,
    }))
}

async fn fetch_rune_index_validation(state: &AppState) -> Result<RuneIndexValidation, String> {
    let mut url = Url::parse(state.ord_base_url.as_str()).map_err(|error| error.to_string())?;
    url.path_segments_mut()
        .map_err(|_| "invalid ord base URL".to_string())?
        .extend(["rune", NGF_RUNE_NAME]);

    let payload = state
        .http_client
        .get(url)
        .header(ACCEPT, "application/json")
        .send()
        .await
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json::<Value>()
        .await
        .map_err(|error| error.to_string())?;

    let rune_name = value_at(
        &payload,
        &[&["entry", "spaced_rune"], &["formatted_name"], &["name"]],
    );
    let rune_number = value_at(&payload, &[&["entry", "number"], &["number"]]);
    let rune_id = value_at(&payload, &[&["id"]]);
    let etching_txid = value_at(&payload, &[&["entry", "etching"], &["etching_txid"]]);

    Ok(RuneIndexValidation {
        source: state.ord_base_url.as_ref().clone(),
        provider_available: true,
        rune_name_matches: rune_name.as_deref() == Some(NGF_RUNE_NAME),
        rune_number_matches: rune_number.as_deref() == Some(&NGF_RUNE_NUMBER.to_string()),
        rune_id_matches: rune_id.as_deref() == Some(NGF_RUNE_ID),
        etching_txid_matches: etching_txid.as_deref() == Some(NGF_ETCHING_TXID),
    })
}

async fn fetch_address_balance_validation(
    state: &AppState,
    address: &str,
) -> Result<AddressBalanceValidation, String> {
    let mut url = Url::parse(state.ord_base_url.as_str()).map_err(|error| error.to_string())?;
    url.path_segments_mut()
        .map_err(|_| "invalid ord base URL".to_string())?
        .extend(["address", address]);

    let payload = state
        .http_client
        .get(url)
        .header(ACCEPT, "application/json")
        .send()
        .await
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json::<Value>()
        .await
        .map_err(|error| error.to_string())?;

    let balance = extract_ngf_balance(&payload);
    let has_required_balance = balance
        .as_deref()
        .and_then(parse_balance_to_u128)
        .is_some_and(|value| value >= 1);

    Ok(AddressBalanceValidation {
        source: state.ord_base_url.as_ref().clone(),
        address: address.to_string(),
        ngf_balance: balance,
        has_required_balance,
    })
}

fn value_at(value: &Value, paths: &[&[&str]]) -> Option<String> {
    for path in paths {
        let mut current = value;
        let mut found = true;
        for segment in *path {
            match current.get(*segment) {
                Some(next) => current = next,
                None => {
                    found = false;
                    break;
                }
            }
        }
        if found {
            if let Some(text) = current.as_str() {
                return Some(text.to_string());
            }
            if let Some(number) = current.as_u64() {
                return Some(number.to_string());
            }
        }
    }

    None
}

fn extract_ngf_balance(payload: &Value) -> Option<String> {
    if let Some(entry) = payload
        .get("runes_balances")
        .and_then(|balances| balances.get(NGF_RUNE_NAME))
    {
        return balance_value_to_string(entry);
    }

    for key in ["runes_balances", "balances", "runes"] {
        if let Some(items) = payload.get(key).and_then(Value::as_array) {
            for item in items {
                let name = item
                    .get("name")
                    .or_else(|| item.get("rune"))
                    .or_else(|| item.get("spaced_rune"))
                    .and_then(Value::as_str);

                if name == Some(NGF_RUNE_NAME) {
                    if let Some(balance) = item.get("balance").or_else(|| item.get("amount")) {
                        return balance_value_to_string(balance);
                    }
                }
            }
        }
    }

    None
}

fn balance_value_to_string(value: &Value) -> Option<String> {
    value
        .as_str()
        .map(ToOwned::to_owned)
        .or_else(|| value.as_u64().map(|number| number.to_string()))
        .or_else(|| {
            value
                .get("balance")
                .and_then(|balance| balance.as_str().map(ToOwned::to_owned))
        })
}

fn parse_balance_to_u128(balance: &str) -> Option<u128> {
    balance.replace(',', "").parse::<u128>().ok()
}

fn api_error_from_request(error: impl ToString) -> (StatusCode, Json<Value>) {
    (
        StatusCode::BAD_GATEWAY,
        Json(json!({
            "error": error.to_string(),
        })),
    )
}

fn api_error_from_parse(error: impl ToString) -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({
            "error": error.to_string(),
        })),
    )
}

#[cfg(test)]
mod tests {
    use super::{
        NGF_RUNE_NAME, extract_mempool_ws_update, extract_ngf_balance, parse_balance_to_u128,
        value_at,
    };
    use serde_json::json;

    #[test]
    fn extracts_fee_and_block_from_mempool_ws_message() {
        let payload = json!({
            "blocks": [{ "height": 923867 }],
            "fees": {
                "fastestFee": 25,
                "halfHourFee": 18,
                "economyFee": 12
            }
        })
        .to_string();

        let update = extract_mempool_ws_update(&payload).expect("mempool update");
        assert_eq!(update.block_height, Some(923867));
        assert_eq!(update.low_fee, Some(12));
        assert_eq!(update.medium_fee, Some(18));
        assert_eq!(update.high_fee, Some(25));
    }

    #[test]
    fn extracts_ngf_balance_from_array_payload() {
        let payload = json!({
            "runes": [
                {"name": NGF_RUNE_NAME, "balance": "1240"}
            ]
        });

        assert_eq!(extract_ngf_balance(&payload).as_deref(), Some("1240"));
    }

    #[test]
    fn parses_balance_strings() {
        assert_eq!(parse_balance_to_u128("1,240"), Some(1240));
    }

    #[test]
    fn resolves_fallback_value_paths() {
        let payload = json!({ "entry": { "spaced_rune": NGF_RUNE_NAME } });
        let value = value_at(&payload, &[&["entry", "spaced_rune"], &["name"]]);
        assert_eq!(value.as_deref(), Some(NGF_RUNE_NAME));
    }
}
