# Padlock key manager

### Start the network
```bash
# Also starts nginx to proxy requests to the api server
docker-compose up
```

### Start the rest-server so we can query the network
```bash
# in a new terminal
docker-compose exec secretdev \
  secretcli rest-server \
  --node tcp://localhost:26657 \
  --trust-node \
  --laddr tcp://0.0.0.0:1317
```

### Start the faucet, to fund burner wallets
```bash
git clone https://github.com/enigmampc/SecretNetwork/
cd SecretNetwork/cosmwasm-js
# check out develop branch for now
git checkout develop
# build the JS components
yarn build
# start the faucet
cd packages/faucet
yarn dev-start
```

### Fund the faucet holder (if this is different from your test account)
```bash
docker-compose exec secretdev \
  secretcli tx send \
  a secret1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmenn2dx \
  100000000000uscrt --from a \
  --keyring-backend test --yes
```

### Deploy the contract
```bash
node client/scripts/deploy_contract.js
```

### Start the app
```bash
cd client
yarn start:local
```