#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { EnigmaUtils, Secp256k1Pen, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey } = require("secretjs");
const fs = require("fs");
const crypto = require('crypto');
var eccrypto = require("eccrypto");

const httpUrl = "http://localhost:1317";
const faucet = {
  mnemonic:
    "join practice device whale adapt one service east festival filter lawsuit option such vacuum purpose culture uncle toy coil wet reveal cute october desk",
  address: "secret18acg8ylf9ppgnzqszx0qg5aww53qayrwfh0q0v",
};


const customFees = {
  upload: {
    amount: [{ amount: "25000", denom: "uscrt" }],
    gas: "2000000",
  },
  init: {
    amount: [{ amount: "0", denom: "uscrt" }],
    gas: "500000",
  },
  exec: {
    amount: [{ amount: "0", denom: "uscrt" }],
    gas: "500000",
  },
  send: {
    amount: [{ amount: "2000", denom: "uscrt" }],
    gas: "80000",
  },
}
async function main() {
  const signingPen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
    const myWalletAddress = pubkeyToAddress(
      encodeSecp256k1Pubkey(signingPen.pubkey),
      "secret"
    );
  const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();
  const client = new SigningCosmWasmClient(
    httpUrl,
    myWalletAddress,
    (signBytes) => signingPen.sign(signBytes),
    txEncryptionSeed, customFees
  );

  const wasm = fs.readFileSync(__dirname + "/../../contracts/contract.wasm");
  const uploadReceipt = await client.upload(wasm, {})
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  const memo = `Padlock Vault`;
  const initMsg = {"seed_phrase": "I love cupcakes"}
  const { contractAddress, logs } = await client.instantiate(uploadReceipt.codeId, initMsg, memo);
  console.info(`Contract instantiated at ${contractAddress}`);

  const initAttributes = logs[0].events[1].attributes;
  let initPublicKey = initAttributes.find(x => x.key === "public_key").value;
  let initPrivateKey = initAttributes.find(x => x.key === "private_key").value;

  console.log(`publicKey=${initPublicKey}, privateKey=${initPrivateKey}`);

  
  const address = myWalletAddress
  const id = 1;
  const isWhitelistedMsg = {"IsWhitelisted": {"address": address, "id": id}}
  let result = await client.queryContractSmart(contractAddress, isWhitelistedMsg);
  console.log(`IsWhitelisted address: ${JSON.stringify(result, null, 1)}`);

  const whitelistMsg = {"WhitelistAddress": {"address": address, "id": id}}
  result = await client.execute(contractAddress, whitelistMsg);
  console.log(`Whitelisted address: ${JSON.stringify(result)}`);

  result = await client.queryContractSmart(contractAddress, isWhitelistedMsg);
  console.log(`IsWhitelisted address: ${JSON.stringify(result, null, 1)}`);

  const keyRequestMsg = {"RequestSharedKey": {"id": id}}
  result = await client.execute(contractAddress, keyRequestMsg);
  console.log(`SharedKey result: ${JSON.stringify(result)}`);




}

main().then(
  () => {
    console.info("Contract deployed.");
    process.exit(0);
  },
  error => {
    console.error(error);
    process.exit(1);
  },
);
