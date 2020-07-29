use cosmwasm_std::{StdError, StdResult, Storage, CanonicalAddr};
use serde::{Deserialize, Serialize};
use cosmwasm_storage::{
    singleton, singleton_read, ReadonlySingleton, Singleton,
};

pub const SEED_KEY: &[u8] = "seed".as_bytes();
pub const WHITELIST_KEY: &[u8] = "whitelist".as_bytes();
pub const OWNER_KEY: &[u8] = "owner".as_bytes();

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct PrivateKeyRecord {
    pub key: [u8; 32],
    pub api_key: String,
    pub passphrase: String,
}

pub fn store_seed<S: Storage>(storage: &mut S, seed: [u8; 32]) {
    storage.set(&SEED_KEY, &seed);
}

pub fn get_seed<S: Storage>(storage: &mut S) -> Vec<u8> {
    storage.get(&SEED_KEY).unwrap()
}

pub fn store_key_record<S: Storage>(
    storage: &mut S,
    key_id: &String,
    private_key: [u8; 32],
    api_key: &String,
    passphrase: &String,
) {
    let record = PrivateKeyRecord {
        api_key: api_key.clone(),
        passphrase: passphrase.clone(),
        key: private_key,
    };

    let record_bytes: Vec<u8> = bincode2::serialize(&record).unwrap();

    storage.set(&key_id.as_bytes(), record_bytes.as_slice());
}

pub fn get_key_record<S: Storage>(storage: &mut S, key_id: &String) -> StdResult<PrivateKeyRecord> {
    if let Some(record_bytes) = storage.get(&key_id.as_bytes()) {
        let record: PrivateKeyRecord = bincode2::deserialize(&record_bytes).unwrap();
        Ok(record)
    } else {
        Err(StdError::GenericErr {
            msg: "Key ID not found".to_string(),
            backtrace: None,
        })
    }
}

pub fn store_shared_key_record<S: Storage>(
    storage: &mut S,
    private_key: [u8; 32],
    passphrase: &String,
) {
    let record = PrivateKeyRecord {
        api_key: "shared_key".to_string(),
        passphrase: passphrase.clone(),
        key: private_key,
    };

    let record_bytes: Vec<u8> = bincode2::serialize(&record).unwrap();

    storage.set(&record.api_key.as_bytes(), record_bytes.as_slice());
}

pub fn get_shared_key_record<S: Storage>(storage: &mut S) -> StdResult<PrivateKeyRecord> {
    if let Some(record_bytes) = storage.get("shared_key".to_string().as_bytes()) {
        let record: PrivateKeyRecord = bincode2::deserialize(&record_bytes).unwrap();
        Ok(record)
    } else {
        Err(StdError::GenericErr {
            msg: "Key ID not found".to_string(),
            backtrace: None,
        })
    }
}

pub fn whitelist<S: Storage>(storage: &mut S) -> Singleton<S, Vec<String>> {
    singleton(storage, WHITELIST_KEY)
}

pub fn whitelist_read<S: Storage>(storage: &S) -> ReadonlySingleton<S, Vec<String>> {
    singleton_read(storage, WHITELIST_KEY)
}

pub fn owner<S: Storage>(storage: &mut S) -> Singleton<S, CanonicalAddr> {
    singleton(storage, OWNER_KEY)
}

pub fn owner_read<S: Storage>(storage: &S) -> ReadonlySingleton<S, CanonicalAddr> {
    singleton_read(storage, OWNER_KEY)
}
