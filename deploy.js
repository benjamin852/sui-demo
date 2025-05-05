// deploy.js
import "dotenv/config";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { execSync } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// import { getObjectIdsByObjectTypes } from "./sui-call.ts";



export const getObjectIdsByObjectTypes = (txn, objectTypes) =>
  objectTypes.map((objectType) => {
      const objectId = txn.objectChanges.find((change) => change.objectType?.includes(objectType))?.objectId;

      if (!objectId) {
          throw new Error(`No object found for type: ${objectType}`);
      }

      return objectId;
  });

async function main() {
  // 1. Load & decode your key
  const rawKey = process.env.PRIVATE_KEY;
  if (!rawKey) {
    console.error("❌ PRIVATE_KEY not set in your .env");
    process.exit(1);
  }
  const { schema, secretKey } = decodeSuiPrivateKey(rawKey);
  let keypair;
  if (schema === "ED25519") {
    keypair = Ed25519Keypair.fromSecretKey(secretKey);
  } else if (schema === "Secp256k1") {
    keypair = Secp256k1Keypair.fromSecretKey(secretKey);
  } else {
    throw new Error(`Unsupported key scheme: ${schema}`);
  }

  // 2. Build your Move package
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkgPath = path.resolve(__dirname);
  console.log("📦 Building Move package at:", pkgPath);
  const out = execSync(
    `sui move build --dump-bytecode-as-base64 --path ${pkgPath}`,
    { encoding: "utf-8" }
  );
  const { modules, dependencies } = JSON.parse(out);

  // 3. Prepare & publish the transaction
  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
  const tx = new Transaction();

  // Publish returns [UpgradeCap]
  const [upgradeCap] = tx.publish({ modules, dependencies });

  // **Key fix:** pass the address string directly, not wrapped in tx.pure()
  const myAddress = keypair.getPublicKey().toSuiAddress();
  tx.transferObjects([upgradeCap], myAddress);

  console.log("🚀 Sending publish transaction…");

  console.log(keypair, 'the keypair')
  console.log(tx, 'the tx')

  const response = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  });

  // 4. Results
  console.log("✅ Publish succeeded!");

  // after your signAndExecuteTransaction(...) call:
  const publishedChange = response.objectChanges.find(
    (c) => c.type === "published"
  );
  console.log("Published package ID:", publishedChange?.packageId);


  const [gmpSingletonObjectId] = getObjectIdsByObjectTypes(response, [`${publishedChange.packageId}::gmp::Singleton`]);

  console.log(gmpSingletonObjectId, 'gmpSingletonObjectId')


}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});