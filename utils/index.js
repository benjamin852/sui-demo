import { ethers } from 'ethers';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import 'dotenv/config';

/**
 * Parse Axelar Gateway info (hardcoded for now)
 */
export function parseGatewayInfo() {
  return {
    gateway: '0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db',
    packageId: '0x6ddfcdd14a1019d13485a724db892fa0defe580f19c991eaabd690140abb21e4',
  };
}

/**
 * Parse Relayer Discovery info (hardcoded for now)
 */
export function parseDiscoveryInfo() {
  return {
    discovery: '0xac080ff19b7d44c9362b83628253a4b55747779096034a72ca62ce89a188305e',
    packageId: '0x2f871726329f555bc3fa6eec129f259a8bce3cb3989b39dd75a627a1a0961bc2',
  };
}

/**
 * Convert a human-readable amount into its atomic unit representation.
 * @param {string} amount - The amount as a decimal string, e.g. "1.5"
 * @param {number} [decimals=9] - Number of decimal places (defaults to 9 for SUI)
 * @returns {bigint} The amount in atomic units
 */
export function getUnitAmount(amount, decimals = 9) {
  return ethers.utils.parseUnits(amount, decimals).toBigInt();
}

/**
 * Load the user's Ed25519 keypair and initialize a SuiClient
 * @returns {[Ed25519Keypair, SuiClient]}
 */
export function getWallet() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

  const rawKey = process.env.PRIVATE_KEY;
  if (!rawKey) {
    console.error('PRIVATE_KEY not set in your .env');
    process.exit(1);
  }

  const keypair = Ed25519Keypair.fromSecretKey(rawKey);
  return [keypair, client];
}
