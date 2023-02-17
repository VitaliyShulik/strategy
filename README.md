# Investing strategy smart contract

DeFi investing strategy is a smart contract that integrates with the existing yield farm.

## Preparation

- Copy `.env.example`, rename it to `.env` and fill all constants, where:
  - **BNB_RPC** - an url that provide possible to connect to the BSC network mainnet for tests
  - **MNEMONIC** - a 12 or 24 word mnemonic phrase as defined by BIP39, the first address must have a minimum of 1 BUSD to pass the tests

## Installation

### Install dependencies

```sh
yarn
```

### Compile smart contracts

```sh
npx hardhat compile
```

### Start tests

```sh
npx hardhat test
```
