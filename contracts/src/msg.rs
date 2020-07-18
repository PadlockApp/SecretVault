use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_std::HumanAddr;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InitMsg {
    pub seed_phrase: String
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum HandleMsg {
    NewKey {
        key_seed: String,
        passphrase: String,
    },
    RequestSharedKey {
    },
    WhitelistAddress {
        address: HumanAddr
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum QueryMsg {
    IsWhitelisted { address: HumanAddr }
}

/////////////////////////////// Migrate ///////////////////////////////
// Isn't supported by the Secret Network, but we must declare this to
// comply with CosmWasm 0.9 API
///////////////////////////////////////////////////////////////////////

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
