pub mod bitcoin;

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

const TREASURY_ADDRESS: &str =
    "bc1pl8qtw4g9afscmctydmv56mak4m9leqxyqlvqgxaltj2d5wt9wteqqgpdug";

#[derive(Clone, Default)]
pub struct AppState {
    treasury_address: Arc<String>,
}

pub fn app() -> Router {
    let state = AppState {
        treasury_address: Arc::new(TREASURY_ADDRESS.to_string()),
    };

    Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/mempool/fees", get(get_mempool_fees))
        .route("/api/v1/inscribe/commit", post(create_commit_tx))
        .route("/api/v1/psbt/validate", post(validate_psbt_handler))
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
}

async fn get_mempool_fees() -> Json<MempoolFees> {
    Json(MempoolFees {
        low_fee: 12,
        medium_fee: 18,
        high_fee: 25,
        block_height: 860240,
    })
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
) -> Result<Json<PsbtValidationRes>, (StatusCode, Json<serde_json::Value>)> {
    match bitcoin::psbt::verify_marketplace_psbt(&payload.psbt_hex, payload.price_sats, &state.treasury_address) {
        Ok(verification) => Ok(Json(PsbtValidationRes {
            is_valid: verification.is_valid,
            price_sats: verification.price_sats,
            treasury_fee_sats: verification.treasury_fee_sats,
            sighash_type: verification.sighash_type,
            treasury_address: state.treasury_address.as_ref().clone(),
        })),
        Err(error) => Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "error": error.to_string(),
                "treasury_address": state.treasury_address.as_ref().clone(),
            })),
        )),
    }
}
