import 'dotenv/config'

/**
 * Broadcast a transaction to the Sui network, with optional user confirmation
 */
export async function broadcast(client, keypair, tx, actionName) {

  const receipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  })

  console.log(actionName || '✅ Tx', receipt.digest)
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
