# How to run

Put all environment in latest versions
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

# Deploy a contract
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

```bash
 Contract 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde successfully deployed.
```
# Check version compatibility
nargo
aztec-nargo
bb



# Check for contract

```bash
 aztec get-contract-data  0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde
```

# Create account 

```bash
aztec-wallet create-account  \
-sk clavesecretaaztec \
-a  cuentaJuan 

```
# Check for accounts

# interact with contract

```bash
aztec register-contract \
 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde \
/home/juanbel/Documents/Aztec/jwtvoting/client/public/circuit/contractVerifyproof/target/contractVerifyproof-jwtVotingQuest.json
```

```bash
aztec-wallet register-contract \
 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde \
/home/juanbel/Documents/Aztec/jwtvoting/client/public/circuit/contractVerifyproof/target/contractVerifyproof-jwtVotingQuest.json
```

```bash
 aztec simulate \
 -ca 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde \
 -c /home/juanbel/Documents/Aztec/jwtvoting/client/public/circuit/contractVerifyproof/src/artifacts/jwtVotingQuest.ts \
 -f test0 \
  get_description
```



```bash
 aztec-wallet simulate \
 -ca 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde \
 -sk \
  get_description
```

```bash
 aztec-wallet simulate \
 -ca 0x2b4d0f35837b5dc77c3d755eb37c0ec5bb49a036a737244ba2ec9e9da4db8bde \
 -f test0 \
  get_description
```
# discord bot

# proof data
