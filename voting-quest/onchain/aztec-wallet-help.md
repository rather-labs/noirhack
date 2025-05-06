Usage: wallet [options] [command]

Aztec wallet

Options:
  -V, --version                                       output the version number
  -d, --data-dir <string>                             Storage directory for wallet data (default: "/home/juanbel/.aztec/wallet")
  -p, --prover <string>                               The type of prover the wallet uses (only applies if not using a remote PXE) (choices:
                                                      "wasm", "native", "none", default: "native", env: PXE_PROVER)
  --remote-pxe                                        Connect to an external PXE RPC server, instead of the local one (default: false, env:
                                                      REMOTE_PXE)
  -n, --node-url <string>                             URL of the Aztec node to connect to (default: "http://host.docker.internal:8080", env:
                                                      AZTEC_NODE_URL)
  -h, --help                                          display help for command

Commands:
  import-test-accounts [options]                      Import test accounts from pxe.
  create-account [options]                            Creates an aztec account that can be used for sending transactions.
  deploy-account [options]                            Deploys an already registered aztec account that can be used for sending transactions.
  deploy [options] [artifact]                         Deploys a compiled Aztec.nr contract to Aztec.
  send [options] <functionName>                       Calls a function on an Aztec contract.
  simulate [options] <functionName>                   Simulates the execution of a function on an Aztec contract.
  profile [options] <functionName>                    Profiles a private function by counting the unconditional operations in its execution
                                                      steps
  bridge-fee-juice [options] <amount> <recipient>     Mints L1 Fee Juice and pushes them to L2.
  create-authwit [options] <functionName> <caller>    Creates an authorization witness that can be privately sent to a caller so they can
                                                      perform an action on behalf of the provided account
  authorize-action [options] <functionName> <caller>  Authorizes a public call on the caller, so they can perform an action on behalf of the
                                                      provided account
  get-tx [options] [txHash]                           Gets the status of the recent txs, or a detailed view if a specific transaction hash is
                                                      provided
  cancel-tx [options] <txHash>                        Cancels a pending tx by reusing its nonce with a higher fee and an empty payload
  register-sender [options] [address]                 Registers a sender's address in the wallet, so the note synching process will look for
                                                      notes sent by them
  register-contract [options] [address] [artifact]    Registers a contract in this wallet's PXE
  alias <type> <key> <value>                          Aliases information for easy reference.
  get-alias [alias]                                   Shows stored aliases
  create-secret [options]                             Creates an aliased secret to use in other commands
  help [command]                                      display help for command