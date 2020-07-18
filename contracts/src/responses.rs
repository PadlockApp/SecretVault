use cosmwasm_std::{log, HandleResponse, Never };
use serde::{Deserialize, Serialize};

use hex;

#[derive(Clone)]
pub struct CreateKeyResponse {
    pub key_id: String,
    pub api_key: String,
    pub public_key: [u8; 33],
    pub private_key: [u8; 32],
}

#[derive(Clone)]
pub struct SharedKeyResponse {
    pub public_key: [u8; 33],
    pub private_key: [u8; 32],
}

#[derive(Serialize, Deserialize, Clone, PartialEq)]
pub struct WhitelistedResponse {
    pub whitelisted: bool,
}

impl Into<HandleResponse> for SharedKeyResponse {
    fn into(self) -> HandleResponse<Never> {
        let pubkey = hex::encode(self.public_key.as_ref());
        let privkey = hex::encode(self.private_key.as_ref());

        HandleResponse {
            messages: vec![],
            log: vec![
                log("public_key", pubkey),
                log("private_key", privkey),
            ],
            data: None,
        }
    }
}

impl Into<HandleResponse> for CreateKeyResponse {
    fn into(self) -> HandleResponse<Never> {
        let pubkey = hex::encode(self.public_key.as_ref());
        let privkey = hex::encode(self.private_key.as_ref());

        HandleResponse {
            messages: vec![],
            log: vec![
                log("api_key", self.api_key),
                log("key_id", self.key_id),
                log("public_key", pubkey),
                log("private_key", privkey),
            ],
            data: None,
        }
    }
}

impl Returnable for CreateKeyResponse {}
impl Returnable for SharedKeyResponse {}

trait Returnable
where
    Self: Into<HandleResponse>,
{
}
