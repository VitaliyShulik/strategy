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
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      forking: {
        url: process.env.BNB_RPC,
        // blockNumber: 1000000,
      },
      allowUnlimitedContractSize: true,
    }
  },
};