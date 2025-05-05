import 'dotenv/config'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'

// 🔧 shim CommonJS in an ES module:
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


/**
 * Prompt the user for confirmation before executing a transaction
 */
export async function askForConfirmation(actionName, commandOptions = {}) {
  const { yes } = commandOptions
  if (!yes) {
    const promptTitle = actionName ? `Confirm ${actionName} Tx?` : 'Confirm Tx?'
    const aborted = prompt(promptTitle)
    if (aborted) {
      console.error('Aborted')
      process.exit(0)
    }
  }
}

/**
 * Broadcast a transaction to the Sui network, with optional user confirmation
 */
export async function broadcast(
  client,
  keypair,
  tx,
  actionName,
  commandOptions = {}
) {
  // await askForConfirmation(actionName, commandOptions)

  const receipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
    },
});
  

  console.log(actionName || '✅ Tx', receipt.digest)

  // return receipt
}

/**
 * Execute an approved message via Axelar CGP
 */
export async function broadcastExecuteApprovedMessage(
  client,
  keypair,
  discoveryInfo,
  gatewayInfo,
  messageInfo,
  actionName,
  commandOptions = {}
) {
  await askForConfirmation(actionName, commandOptions)
  const receipt = await execute(
    client,
    keypair,
    discoveryInfo,
    gatewayInfo,
    messageInfo,
    {}
  )

  console.log(actionName || 'Tx', receipt.digest)

  return receipt
}

/**
 * Find object IDs by their Move struct types in a transaction's objectChanges
 */
export function getObjectIdsByObjectTypes(txn, objectTypes) {
  return objectTypes.map((objectType) => {
    const change = txn.objectChanges.find(
      (c) => c.objectType && c.objectType.includes(objectType)
    )
    if (!change) {
      throw new Error(`No object found for type: ${objectType}`)
    }
    return change.objectId
  })
}
