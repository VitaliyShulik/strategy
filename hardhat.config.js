require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.12"
      },
    ]
  },
  networks: {
    bnb: {
      url: process.env.BNB_RPC,
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    },
    hardhat: {
      forking: {
        url: process.env.BNB_RPC,
        // blockNumber: 1000000,
      },
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      allowUnlimitedContractSize: true,
    }
  },
};