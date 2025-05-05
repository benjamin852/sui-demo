import "dotenv/config";
import { Command } from "commander";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { arrayify } from "ethers/lib/utils.js";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { SuiClient } from "@mysten/sui/client";
import { getWallet, getUnitAmount } from "./utils/index.js";
import { broadcast, broadcastExecuteApprovedMessage, getObjectIdsByObjectTypes } from "./utils/sui-utils.js";
// import suiConfig from './sui-config.json' assert { type: 'json' };


async function sendCommand(keypair, client, args, options, packageId) {
  const [destinationChain, destinationAddress, singletonId, feeAmount, payload] = args;

  const params = options.params;
  // const gasServiceId = "suiConfig.contracts.GasService.objects.GasService";
  const gasServiceId = "0xac1a4ad12d781c2f31edc2aa398154d53dbda0d50cb39a4319093e3b357bc27d";
  // const gatewayId = suiConfig.contracts.AxelarGateway.objects.Gateway;
  const gatewayId = "0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db";

  const unitAmount = getUnitAmount(feeAmount);
  const walletAddr = keypair.getPublicKey().toSuiAddress();
  const refundAddr = options.refundAddress || walletAddr;

  const tx = new Transaction();
  tx.setGasBudget(1e7);
  const [coin] = tx.splitCoins(tx.gas, [unitAmount]);


  console.log('---------------------');

    
  console.log(singletonId, 'singletonObjectId');
  console.log(gatewayId, 'gatewayObjectId');
  console.log(gasServiceId, 'gasServiceObjectId');
  const destChain =    tx.pure(bcs.string().serialize(destinationChain).toBytes())
  console.log(destChain, 'destChain');

  const destAddr = tx.pure(bcs.string().serialize(destinationAddress).toBytes())
  console.log(destAddr, 'destinationAddress');
  
  const payloadLog = tx.pure(bcs.vector(bcs.u8()).serialize(arrayify(payload)).toBytes())
  console.log(payloadLog, 'payload'); 

  console.log(tx.pure.address(refundAddr), 'refundAddress');

  console.log(coin, 'coin');

  const paramsLog = tx.pure(bcs.vector(bcs.u8()).serialize(arrayify(params)).toBytes())
  console.log(paramsLog, 'params');

  console.log('---------------------');


  tx.moveCall({
    target: `${packageId}::gmp::send_call`,
    arguments: [
      tx.object(singletonId),
      tx.object(gatewayId),
      tx.object(gasServiceId),
      tx.pure(bcs.string().serialize(destinationChain).toBytes()),
      tx.pure(bcs.string().serialize(destinationAddress).toBytes()),
      tx.pure(bcs.vector(bcs.u8()).serialize(arrayify(payload)).toBytes()),
      tx.pure.address(refundAddr),
      coin,
      tx.pure(bcs.vector(bcs.u8()).serialize(arrayify(params)).toBytes()),
    ],
  });

  await broadcast(client, keypair, tx, "send_call", options);
}

async function main() {
  const program = new Command();
  program
    .name("gmp")
    .description("GMP Example CLI")
    .option("-e, --env <env>", "Environment (e.g. testnet|mainnet)", "testnet")
    .option("-c, --chainName <chain>", "Chain key in config", "sui-testnet");

  program
    .command("sendCall")
    .description("Send a GMP call")
    .requiredOption("--destChain <chain>", "Destination chain")
    .requiredOption("--destAddress <addr>", "Destination address")
    .requiredOption("--singletonId <singleton>", "Singleton object ID")
    .requiredOption("--fee <amount>", "Fee in atomic units")
    .requiredOption("--payload <hex>", "Payload bytes (hex)")
    .requiredOption("--params <params>", "GMP call params (hex)")
    .requiredOption("--refundAddress <addr>", "Refund address")
    .requiredOption("--packageId <packageId>", "Package ID")
    .action(async (opts) => {
      const options = { ...program.opts(), ...opts };
        const [keypair, client] = getWallet();
        await sendCommand(
          keypair,
          client,
          [
            options.destChain,
            options.destAddress,
            options.singletonId,
            options.fee,
            options.payload,
          ],
          options,
          options.packageId
        );
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
