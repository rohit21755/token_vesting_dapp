// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
// import TokenvestingIDL from '../target/idl/tokenvesting.json'
// import type { Tokenvesting } from '../target/types/tokenvesting'
import type  { Vesting } from 'anchor/target/types/vesting'
import VestingIDL from '../target/idl/vesting.json'

// Re-export the generated IDL and type
export { Vesting , VestingIDL }

// The programId is imported from the program IDL.
export const VESTING_PROGRAM_ID = new PublicKey(VestingIDL.address)

// This is a helper function to get the Tokenvesting Anchor program.
export function getVestingProgram(provider: AnchorProvider) {
  return new Program(VestingIDL as Vesting, provider)
}

// This is a helper function to get the program ID for the Tokenvesting program depending on the cluster.
export function getVestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tokenvesting program on devnet and testnet.
      return new PublicKey('CHPx5NhwYyLZudH4mDxsoTAZ2ogUpUGYNN6Rhf1rPgAJ')
    case 'mainnet-beta':
    default:
      return VESTING_PROGRAM_ID
  }
}
