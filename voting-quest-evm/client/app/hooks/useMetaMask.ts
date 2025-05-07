import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function useMetaMask() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const metaMaskConnector = connectors.find((connector) => connector.name === 'MetaMask')

  const connectMetaMask = async () => {
    if (metaMaskConnector) {
      await connect({ connector: metaMaskConnector })
    }
  }

  return {
    address,
    isConnected,
    connectMetaMask,
    disconnect
  }
} 