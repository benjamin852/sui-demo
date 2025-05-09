import 'dotenv/config'
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'
import { arrayify } from 'ethers/lib/utils.js'
import { getWallet, getUnitAmount } from '../utils/index.js'
import { broadcast } from '../utils/sui-utils.js'

async function sendCommand(keypair, client, args, options, packageId) {
  const [
    destinationChain,
    destinationAddress,
    singletonId,
    feeAmount,
    payload,
  ] = args

  const gasServiceId =
    '0xac1a4ad12d781c2f31edc2aa398154d53dbda0d50cb39a4319093e3b357bc27d'
  const gatewayId =
    '0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db'

  const unitAmount = getUnitAmount(feeAmount)
  const walletAddr = keypair.getPublicKey().toSuiAddress()
  const refundAddr = options.refundAddress || walletAddr

  const tx = new Transaction()

  const [coin] = tx.splitCoins(tx.gas, [unitAmount])

  const message = payload
  const raw = new TextEncoder().encode(message)

  const serializedPayload = bcs.vector(bcs.u8()).serialize(raw)

  tx.moveCall({
    target: `${packageId}::gmp::send_call`,
    arguments: [
      tx.object(singletonId),
      tx.object(gatewayId),
      tx.object(gasServiceId),
      tx.pure(bcs.string().serialize(destinationChain).toBytes()),
      tx.pure(bcs.string().serialize(destinationAddress).toBytes()),
      tx.pure(serializedPayload),
      tx.pure.address(refundAddr),
      coin,
      tx.pure(
        bcs
          .vector(bcs.u8())
          .serialize(new Uint8Array(arrayify(0x0)))
          .toBytes()
      ),
    ],
  })

  await broadcast(client, keypair, tx, 'send_call', options)
}

async function main() {
  const program = new Command()
  program
    .name('gmp')
    .description('GMP Example CLI')

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
    .action(async (opts) => {
      const options = { ...program.opts(), ...opts }
      const [keypair, client] = getWallet()
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
      )
    })

  await program.parseAsync(process.argv)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
