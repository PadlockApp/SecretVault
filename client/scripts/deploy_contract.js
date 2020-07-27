#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { EnigmaUtils, Secp256k1Pen, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey } = require("secretjs");
const fs = require("fs");
const crypto = require('crypto');
var eccrypto = require("eccrypto");

const httpUrl = "http://localhost:1317";
const faucet = {
  mnemonic:
    "night galaxy steak breeze inquiry patch entry only dwarf economy first student dad attitude assume agent brand disorder artist shallow echo curtain truly kangaroo",
  address: "secret18acg8ylf9ppgnzqszx0qg5aww53qayrwfh0q0v",
};



/**
 * Whitelists an address.
 */
async function whitelistAddress (address) {
    // logger.info(`whitelisting ${address}`)
    // if (!isValidCosmosAddress(address)) {
    //     throw new Error(`address=${address} is invalid`)
    // }

    const whitelistMsg = {"address": address}
    const client = await getClient()
    let result = await client.execute(contractAddress, whitelistMsg);
    console.log(`Whitelisted address: ${JSON.stringify(result)}`);
}

// const key_seed = new Buffer.from("I love cupcakes").toString('base64')
// const passphrase = "this too shall pass"
// const genKeyMsg = {
//   NewKey: {
//     key_seed: key_seed, 
//     passphrase: passphrase
//   }
// }

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

  

  const address = 'secret18acg8ylf9ppgnzqszx0qg5aww53qayrwfh0q0v'
  const whitelistMsg = {"WhitelistAddress": {"address": address}}
  let result = await client.execute(contractAddress, whitelistMsg);
  console.log(`Whitelisted address: ${JSON.stringify(result)}`);


  // console.log('Generating key pair');
  // let result = await client.execute(contractAddress, genKeyMsg);
  // console.log(`Generated key: ${JSON.stringify(result)}`);

  // const attributes = result.logs[0].events[1].attributes;
  // let apiKey = attributes.find(x => x.key === "api_key").value;
  // let keyId = attributes.find(x => x.key === "key_id").value;
  // let publicKey = attributes.find(x => x.key === "public_key").value;
  // let privateKey = attributes.find(x => x.key === "private_key").value;

  // console.log(`apiKey=${apiKey}, keyId=${keyId}, publicKey=${publicKey}, privateKey=${privateKey}`);

  // Test signing
  // const message = new Buffer.from("just cupcakes").toString('base64');
  // const data = crypto.createHash('md5').update(message).digest("hex").length;

  // const signMsg = {
  //   Sign: 
  //     {
  //       passphrase: passphrase,
  //       key_id: keyId,
  //       data: data,
  //       api_key: apiKey
  //     }
  // }

  // result = await client.execute(contractAddress, signMsg);
  // console.log(`Signed message : ${JSON.stringify(result)}`);
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
