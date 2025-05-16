
import { execSync } from 'child_process'
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'


export const getObjectIdsByObjectTypes = (txn, objectTypes) =>
  objectTypes.map((objectType) => {
    const objectId = txn.objectChanges.find((change) =>
      change.objectType?.includes(objectType)
    )?.objectId

    if (!objectId) {
      throw new Error(`No object found for type: ${objectType}`)
    }
    return objectId
  })

async function run() {
  // Decode key
  const [keypair, client] = getWallet()

  // Build the Move package
  console.log('📦 Building Move package')
  const buildOutput = execSync(`sui move build --dump-bytecode-as-base64`, {
    encoding: 'utf-8',
  })

  const { modules, dependencies } = JSON.parse(buildOutput)

  // Prepare & publish
  const tx = new Transaction()
  const [upgradeCap] = tx.publish({ modules, dependencies })

  const myAddress = keypair.getPublicKey().toSuiAddress()
  tx.transferObjects([upgradeCap], myAddress)

  console.log('🚀 Sending publish transaction…')
  const response = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showObjectChanges: true },
  })
  console.log('✅ Publish succeeded!')

  // Extract published package ID
  const publishedChange = response.objectChanges.find(
    (c) => c.type === 'published'
  )
  console.log('📦 Published package ID:', publishedChange?.packageId)

  // Find your Singleton object
  const [gmpSingletonObjectId] = getObjectIdsByObjectTypes(response, [
    `${publishedChange.packageId}::gmp::Singleton`,
  ])
  console.log('🔑 GMP Singleton Object ID:', gmpSingletonObjectId)
}

const program = new Command()
program
  .description('Build and publish a Sui Move package with GMP support')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

program.parse(process.argv)
