Usage: aztec [options] [command]

Aztec command line interface

Options:
  -V, --version                                                   output the version number
  -h, --help                                                      display help for command

Commands:
  add-contract [options]                                          Adds an existing contract to the PXE. This is useful if you have deployed a
                                                                  contract outside of the PXE and want to use it with the PXE.
  add-l1-validator [options]                                      Adds a validator to the L1 rollup contract.
  advance-epoch [options]                                         Use L1 cheat codes to warp time until the next epoch.
  authorize-action [options] <functionName> <caller>              Authorizes a public call on the caller, so they can perform an action on
                                                                  behalf of the provided account
  block-number [options]                                          Gets the current Aztec L2 block number.
  bootstrap-network [options]                                     Bootstrap a new network
  bridge-erc20 [options] <amount> <recipient>                     Bridges ERC20 tokens to L2.
  bridge-fee-juice [options] <amount> <recipient>                 Mints L1 Fee Juice and pushes them to L2.
  cancel-tx [options] <txHash>                                    Cancels a pending tx by reusing its nonce with a higher fee and an empty
                                                                  payload
  codegen [options] <noir-abi-path>                               Validates and generates an Aztec Contract ABI from Noir ABI.
  compute-selector <functionSignature>                            Given a function signature, it computes a selector
  create-account [options]                                        Creates an aztec account that can be used for sending transactions.
  create-authwit [options] <functionName> <caller>                Creates an authorization witness that can be privately sent to a caller so
                                                                  they can perform an action on behalf of the provided account
  create-l1-account [options]
  debug-rollup [options]                                          Debugs the rollup contract.
  decode-enr <enr>                                                Decodes an ENR record
  deploy [options] [artifact]                                     Deploys a compiled Aztec.nr contract to Aztec.
  deploy-account [options]                                        Deploys an already registered aztec account that can be used for sending
                                                                  transactions.
  deploy-l1-contracts [options]                                   Deploys all necessary Ethereum contracts for Aztec.
  deploy-l1-verifier [options]                                    Deploys the rollup verifier contract
  deploy-new-rollup [options]                                     Deploys a new rollup contract and adds it to the registry (if you are the
                                                                  owner).
  deposit-governance-tokens [options]                             Deposits governance tokens to the governance contract.
  drip-faucet [options]                                           Drip the faucet
  example-contracts                                               Lists the example contracts available to deploy from @aztec/noir-contracts.js
  execute-governance-proposal [options]                           Executes a governance proposal.
  fast-forward-epochs [options]                                   Fast forwards the epoch of the L1 rollup contract.
  generate-bootnode-enr [options] <privateKey> <p2pIp> <p2pPort>  Generates the encoded ENR record for a bootnode.
  generate-keys [options]                                         Generates encryption and signing private keys.
  generate-l1-account [options]                                   Generates a new private key for an account on L1.
  generate-p2p-private-key                                        Generates a LibP2P peer private key.
  generate-secret-and-hash                                        Generates an arbitrary secret (Fr), and its hash (using aztec-nr defaults)
  get-account [options] <address>                                 Gets an account given its Aztec address.
  get-accounts [options]                                          Gets all the Aztec accounts stored in the PXE.
  get-block [options] [blockNumber]                               Gets info for a given block or latest.
  get-canonical-sponsored-fpc-address                             Gets the canonical SponsoredFPC address for this any testnet running on the
                                                                  same version as this CLI
  get-contract-data [options] <contractAddress>                   Gets information about the Aztec contract deployed at the specified address.
  get-current-base-fee [options]                                  Gets the current base fee.
  get-l1-addresses [options]                                      Gets the addresses of the L1 contracts.
  get-l1-balance [options] <who>                                  Gets the balance of an ERC token in L1 for the given Ethereum address.
  get-l1-to-l2-message-witness [options]                          Gets a L1 to L2 message witness.
  get-logs [options]                                              Gets all the public logs from an intersection of all the filter params.
  get-node-info [options]                                         Gets the information of an Aztec node from a PXE or directly from an Aztec
                                                                  node.
  get-pxe-info [options]                                          Gets the information of a PXE at a URL.
  get-tx [options] [txHash]                                       Gets the status of the recent txs, or a detailed view if a specific
                                                                  transaction hash is provided
  help [command]                                                  display help for command
  import-test-accounts [options]                                  Import test accounts from pxe.
  inspect-contract <contractArtifactFile>                         Shows list of external callable functions for a contract
  parse-parameter-struct [options] <encodedString>                Helper for parsing an encoded string into a contract's parameter struct.
  preload-crs                                                     Preload the points data needed for proving and verifying
  profile [options] <functionName>                                Profiles a private function by counting the unconditional operations in its
                                                                  execution steps
  propose-with-lock [options]                                     Makes a proposal to governance with a lock
  prune-rollup [options]                                          Prunes the pending chain on the rollup contract.
  register-contract [options] [address] [artifact]                Registers a contract in this wallet's PXE
  register-sender [options] [address]                             Registers a sender's address in the wallet, so the note synching process will
                                                                  look for notes sent by them
  remove-l1-validator [options]                                   Removes a validator to the L1 rollup contract.
  send [options] <functionName>                                   Calls a function on an Aztec contract.
  sequencers [options] <command> [who]                            Manages or queries registered sequencers on the L1 rollup contract.
  setup-protocol-contracts [options]                              Bootstrap the blockchain by initializing all the protocol contracts
  simulate [options] <functionName>                               Simulates the execution of a function on an Aztec contract.
  start [options]                                                 Starts Aztec modules. Options for each module can be set as key-value pairs
                                                                  (e.g. "option1=value1,option2=value2") or as environment variables.
  update [options] [projectPath]                                  Updates Nodejs and Noir dependencies
  vote-on-governance-proposal [options]                           Votes on a governance proposal.


  Additional commands:

    test [options]: starts a dockerized TXE node via
      $ aztec start --txe
    then runs
      $ aztec-nargo test --silence-warnings -