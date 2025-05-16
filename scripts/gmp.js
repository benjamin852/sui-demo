import 'dotenv/config'
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'
import { arrayify } from 'ethers/lib/utils.js'
import { getWallet, getUnitAmount } from '../utils/index.js'

async function run(keypair, client, args, packageId) {
  const [
    destinationChain,
    destinationAddress,
    singletonId,
    feeAmount,
    payload,
    refundAddress,
  ] = args

  const gasServiceId =
    '0xac1a4ad12d781c2f31edc2aa398154d53dbda0d50cb39a4319093e3b357bc27d'
  const gatewayId =
    '0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db'

  const tx = new Transaction()

  const unitAmount = getUnitAmount(feeAmount)

  const [coin] = tx.splitCoins(tx.gas, [unitAmount])

  const encodedPayload = new TextEncoder().encode(payload)
  const serializedPayload = bcs.vector(bcs.u8()).serialize(encodedPayload)

  tx.moveCall({
    target: `${packageId}::gmp::send_call`,
    arguments: [
      tx.object(singletonId),
      tx.object(gatewayId),
      tx.object(gasServiceId),
      tx.pure(bcs.string().serialize(destinationChain).toBytes()),
      tx.pure(bcs.string().serialize(destinationAddress).toBytes()),
      tx.pure(serializedPayload), //
      tx.pure.address(refundAddress),
      coin, //
      tx.pure(
        bcs
          .vector(bcs.u8())
          .serialize(new Uint8Array(arrayify(0x0)))
          .toBytes()
      ),
    ],
  })

  const receipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  })

  console.log('✅ Tx', receipt.digest)
}

const program = new Command()
program
  .command('sendCall')
  .description('Send a GMP call')
  .requiredOption('--destChain <chain>', 'Destination chain')
  .requiredOption('--destAddress <addr>', 'Destination address')
  .requiredOption('--singletonId <singleton>', 'Singleton object ID')
  .requiredOption('--fee <amount>', 'Fee in atomic units')
  .requiredOption('--payload <hex>', 'Payload bytes (hex)')
  .requiredOption('--refundAddress <addr>', 'Refund address')
  .requiredOption('--packageId <packageId>', 'Package ID')
  .action(async (options) => {
    const args = { ...program.opts(), ...options }
    const [keypair, client] = getWallet()
    try {
      await run(
        keypair,
        client,
        [
          args.destChain,
          args.destAddress,
          args.singletonId,
          args.fee,
          args.payload,
          args.refundAddress,
        ],
        args.packageId
      )
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  })

program.parseAsync(process.argv)
