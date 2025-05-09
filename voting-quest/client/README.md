# How to RUN

## Start sandbox with default accounts
```bash
aztec-up
```

Start sanbox
```bash
aztec start --sandbox
```

Initiate default accounts

```bash
aztec-wallet import-test-accounts
```

## Deploy the contract to verify the jwt proof on chain

```bash
cd public/circuit/contractVerifyproof
```

Compile contract
```bash
aztec-nargo compile
```

Generate artifact
```bash
aztec codegen target --outdir src/artifacts
```

Must use node 18
```bash
npm run deploy
```

## Set environment values on env.local file

```bash
# Google OAuth values
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=

# Secret to generate JWT token
NEXTAUTH_SECRET=

# Contract on chain to verify JWT proof (Obtained from previous deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## Run client
```bash
npm run dev
```

# Errors

## Cast vote on chain

After login in, you can generate a proof and cast the vote on-chain calling the function from the deployed contract.

The following is thrown by the browser
```
page.tsx:167 Error casting vote: Error: Type 'object' with value '0x0000000000000000000000000000000000000000000000000000000000000000' passed to BaseField ctor.
    at new BaseField (fields.js:126:19)
    at new Fr (fields.js:267:9)
    at new GasFees (gas_fees.js:81:28)
    at GasFees.from (gas_fees.js:46:16)
    at GasSettings.from (gas_settings.js:32:216)
    at GasSettings.default (gas_settings.js:45:28)
    at ContractFunctionInteraction.getDefaultFeeOptions (base_contract_interaction.js:94:95)
    at ContractFunctionInteraction.getFeeOptions (base_contract_interaction.js:114:46)
    at ContractFunctionInteraction.create (contract_function_interaction.js:29:32)
    at async ContractFunctionInteraction.proveInternal (base_contract_interaction.js:29:27)
    at async eval (base_contract_interaction.js:57:37)
    at async SentTx.waitForReceipt (sent_tx.js:51:24)
    at async SentTx.wait (sent_tx.js:43:25)
    at async castVoteOnChain (noir.ts:264:16)
    at async castVote (page.tsx:164:7)
```

Different versions were tried

### Tested Versions

Below is a table of different versions that were tested, reproducing the same error with all

| Noir                         | Aztec  | noir-jwt|
|------------------------------|--------|---------|
| 1.0.0-beta.3                 | 0.82.2 | 0.4.4   |
| 1.0.0-beta.3                 | 0.84.0 | 0.4.4   |
| 1.0.0-beta.4-d8e4de4.nightly | 0.85.0 | 0.5.0   |

### Tests carried out
* using gas settings to override default on function castVoteOnChain() in /app/utils/noir.ts
