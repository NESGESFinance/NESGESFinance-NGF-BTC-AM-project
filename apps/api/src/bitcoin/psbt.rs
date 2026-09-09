use bitcoin::{Network, address::Address, hex::FromHex, psbt::Psbt};
use serde::{Deserialize, Serialize};
use std::{error::Error, fmt, str::FromStr};

const REQUIRED_SIGHASH: u32 = 0x83;

#[derive(Debug, Serialize, Deserialize)]
pub struct PsbtVerification {
    pub is_valid: bool,
    pub price_sats: u64,
    pub treasury_fee_sats: u64,
    pub sighash_type: String,
}

#[derive(Debug)]
pub enum PsbtVerificationError {
    InvalidHex(bitcoin::hex::HexToBytesError),
    InvalidPsbt(bitcoin::psbt::Error),
    InvalidTreasuryAddress(bitcoin::address::ParseError),
    MissingInputs,
    InvalidSighashType,
    MissingTreasuryOutput { expected: u64, found: u64 },
}

impl fmt::Display for PsbtVerificationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidHex(error) => write!(f, "invalid PSBT hex: {error}"),
            Self::InvalidPsbt(error) => write!(f, "invalid PSBT payload: {error}"),
            Self::InvalidTreasuryAddress(error) => {
                write!(f, "invalid treasury address: {error}")
            }
            Self::MissingInputs => write!(f, "PSBT must include at least one input"),
            Self::InvalidSighashType => write!(
                f,
                "PSBT inputs must declare SIGHASH_SINGLE | SIGHASH_ANYONECANPAY",
            ),
            Self::MissingTreasuryOutput { expected, found } => write!(
                f,
                "PSBT treasury output is below the 2% requirement: expected at least {expected} sats, found {found} sats",
            ),
        }
    }
}

impl Error for PsbtVerificationError {}

impl From<bitcoin::hex::HexToBytesError> for PsbtVerificationError {
    fn from(error: bitcoin::hex::HexToBytesError) -> Self {
        Self::InvalidHex(error)
    }
}

impl From<bitcoin::psbt::Error> for PsbtVerificationError {
    fn from(error: bitcoin::psbt::Error) -> Self {
        Self::InvalidPsbt(error)
    }
}

impl From<bitcoin::address::ParseError> for PsbtVerificationError {
    fn from(error: bitcoin::address::ParseError) -> Self {
        Self::InvalidTreasuryAddress(error)
    }
}

pub fn calculate_treasury_fee(price_sats: u64) -> u64 {
    price_sats.saturating_mul(2) / 100
}

pub fn verify_marketplace_psbt(
    psbt_hex: &str,
    price_sats: u64,
    treasury_address: &str,
) -> Result<PsbtVerification, PsbtVerificationError> {
    let bytes = Vec::<u8>::from_hex(psbt_hex.trim())?;
    let psbt = Psbt::deserialize(&bytes)?;

    if psbt.inputs.is_empty() {
        return Err(PsbtVerificationError::MissingInputs);
    }

    let sighash_valid = psbt
        .inputs
        .iter()
        .all(|input| input.sighash_type.map(|kind| kind.to_u32()) == Some(REQUIRED_SIGHASH));

    if !sighash_valid {
        return Err(PsbtVerificationError::InvalidSighashType);
    }

    let treasury_script = Address::from_str(treasury_address)?
        .require_network(Network::Bitcoin)?
        .script_pubkey();
    let treasury_fee_sats = calculate_treasury_fee(price_sats);

    let treasury_paid = psbt
        .unsigned_tx
        .output
        .iter()
        .filter(|output| output.script_pubkey == treasury_script)
        .map(|output| output.value.to_sat())
        .sum::<u64>();

    if treasury_paid < treasury_fee_sats {
        return Err(PsbtVerificationError::MissingTreasuryOutput {
            expected: treasury_fee_sats,
            found: treasury_paid,
        });
    }

    Ok(PsbtVerification {
        is_valid: true,
        price_sats,
        treasury_fee_sats,
        sighash_type: "SIGHASH_SINGLE|SIGHASH_ANYONECANPAY".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::calculate_treasury_fee;

    #[test]
    fn calculates_two_percent_fee() {
        assert_eq!(calculate_treasury_fee(1_450_000), 29_000);
        assert_eq!(calculate_treasury_fee(99), 1);
    }
}
