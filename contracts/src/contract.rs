use cosmwasm_std::{generic_err, Api, Binary, Env, Extern, HandleResponse, InitResponse,
                   MigrateResponse, Querier, StdError, StdResult, Storage, log, CanonicalAddr,
                   to_binary, HumanAddr};

use crate::msg::{HandleMsg, InitMsg, MigrateMsg, QueryMsg};
use crate::responses::{CreateKeyResponse, SharedKeyResponse, WhitelistedResponse};
use crate::state::{get_seed, store_key_record, store_seed, store_shared_key_record,
                   whitelist, whitelist_read, owner, owner_read, get_shared_key_record};
use crate::utils::{
    generate_api_key, generate_key_id, generate_private_key, generate_seed,
};
use crate::crypto::{pubkey};

pub fn init<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    _env: Env,
    msg: InitMsg,
) -> StdResult<InitResponse> {
    let seed = generate_seed(&msg.seed_phrase);
    store_seed(&mut deps.storage, seed);

    let private_key = generate_private_key(&_env, &seed, &seed);

    store_shared_key_record(
        &mut deps.storage,
        private_key,
        &msg.seed_phrase,
    );
    let public_key = pubkey(&private_key).serialize_compressed();

    let pubkey = hex::encode(&public_key.as_ref());
    let privkey = hex::encode(&private_key.as_ref());

    let mut new_whitelist: Vec<String> = Vec::new();
    whitelist(&mut deps.storage).save(&new_whitelist);
    owner(&mut deps.storage).save(&_env.message.sender);

    Ok(InitResponse {
        messages: vec![],
        log: vec![
            log("public_key", pubkey),
            log("private_key", privkey),
        ],
    })
}

pub fn handle<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: HandleMsg,
) -> StdResult<HandleResponse> {
    let result: HandleResponse = match msg {
        HandleMsg::NewKey {
            key_seed,
            passphrase,
        } => {
            let seed = get_seed(&mut deps.storage);

            let key_id = generate_key_id(&env);

            let api_key: String = generate_api_key(&seed, &env);

            let private_key = generate_private_key(&env, &seed, &key_seed.into_bytes());

            store_key_record(
                &mut deps.storage,
                &key_id,
                private_key,
                &api_key,
                &passphrase,
            );

            let public_key = pubkey(&private_key).serialize_compressed();

            CreateKeyResponse {
                api_key,
                key_id,
                public_key,
                private_key,
            }
            .into()
        },
        HandleMsg::WhitelistAddress { address, id } => {
            let owner = owner_read(&deps.storage).load().unwrap();
            if owner != env.message.sender {
                return Err(StdError::GenericErr {
                    msg: "Unauthorized".to_string(),
                    backtrace: None,
                });
            }
            whitelist_address(deps, address, id)
        },
        HandleMsg::RequestSharedKey {id} => {
            let human = deps.api.human_address(&env.message.sender).unwrap();
            if is_whitelisted(deps, human, id) {
                let record = get_shared_key_record(&mut deps.storage)?;
                let public_key = pubkey(&record.key).serialize_compressed();
                SharedKeyResponse {
                    public_key,
                    private_key: record.key,
                }.into()
            } else {
                return Err(StdError::GenericErr {
                    msg: "Unauthorized".to_string(),
                    backtrace: None,
                });
            }
        },
    };

    Ok(result)
}

pub fn query<S: Storage, A: Api, Q: Querier>(
    _deps: &Extern<S, A, Q>,
    _msg: QueryMsg,
) -> StdResult<Binary> {
    match _msg {
        QueryMsg::IsWhitelisted { address, id } => {

            let is_whitelisted = is_whitelisted(_deps, address, id);

            let out = to_binary(&WhitelistedResponse {
                whitelisted: is_whitelisted,
            })?;
            Ok(out)
        },
    }
}

fn is_whitelisted<S: Storage, A: Api, Q: Querier>(_deps: &Extern<S, A, Q>,
    address: HumanAddr, id: u64,) -> bool {
    let whitelisted = whitelist_read(&_deps.storage).load().unwrap();

    let mut whitelist_key: String = address.to_string().to_owned();
    whitelist_key.push_str(&id.to_string());

    return whitelisted.contains(&whitelist_key);
}

fn whitelist_address<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    address: HumanAddr,
    id: u64,
) -> HandleResponse {
    let mut whitelisted = whitelist(&mut deps.storage).load().unwrap();

    let mut whitelist_key: String = address.to_string().to_owned();
    whitelist_key.push_str(&id.to_string());
    whitelisted.push(whitelist_key);
    whitelist(&mut deps.storage).save(&whitelisted);

    HandleResponse::default()
}

/////////////////////////////// Migrate ///////////////////////////////
// Isn't supported by the Secret Network, but we must declare this to
// comply with CosmWasm 0.9 API
///////////////////////////////////////////////////////////////////////

pub fn migrate<S: Storage, A: Api, Q: Querier>(
    _deps: &mut Extern<S, A, Q>,
    _env: Env,
    _msg: MigrateMsg,
) -> StdResult<MigrateResponse> {
    Err(generic_err("You can only use this contract for migrations"))
}
