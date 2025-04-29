import { mainnet } from 'viem/chains';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import type { Address, Abi, EIP1193Provider } from 'viem';
import { RPC_URL } from '../config/env';

// Public client for read-only calls
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL!),
});

// Wallet client for write (MetaMask or other injected)
const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
export const walletClient =
  provider !== undefined
    ? createWalletClient({
        chain: mainnet,
        transport: custom(provider as EIP1193Provider),
      })
    : undefined;

/**
 * Read-only contract call
 * @param address      Contract address
 * @param abi          Contract ABI
 * @param functionName Name of the read function
 * @param args         Optional arguments array
 */
export async function readContract<T>({
  address,
  abi,
  functionName,
  args,
}: {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}): Promise<T> {
  const result = await publicClient.readContract({
    address,
    abi,
    functionName,
    args,
  });
  return result as T;
}

/**
 * Write contract transaction
 * @param address   Contract address
 * @param abi       Contract ABI
 * @param functionName  Name of the write function
 * @param args      Optional arguments array
 * @returns Transaction hash
 */
export async function writeContract({
  address,
  abi,
  functionName,
  args,
}: {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}): Promise<`0x${string}`> {
  if (!walletClient) throw new Error('Wallet client not initialized');

  const [account] = await walletClient.getAddresses();

  const { request } = await publicClient.simulateContract({
    account,
    address,
    abi,
    functionName,
    args,
  });
  return await walletClient.writeContract(request);
}
