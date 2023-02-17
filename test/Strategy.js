const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const depositTokenAddress = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'; // BUSD
const farmAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652'; // Staking contract
const poolId = 135;

const getTokenInfo = async (tokenContract) => {
  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const denominator = ethers.BigNumber.from(10).pow(decimals)

  return {
    name,
    symbol,
    decimals,
    denominator,
  }

};

describe("Strategy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStrategyFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const DepositToken = await ethers.getContractAt("ERC20", depositTokenAddress);
    const depositTokenInfo = await getTokenInfo(DepositToken);
    const farm = await ethers.getContractAt("MasterChefV2", farmAddress);

    const Strategy = await ethers.getContractFactory("Strategy");
    const strategy = await Strategy.deploy();

    return {
      strategy,
      farm,
      DepositToken,
      depositTokenInfo,
      owner,
      depositor: owner,
    };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { strategy, owner } = await loadFixture(deployStrategyFixture);

      expect(await strategy.owner()).to.equal(owner.address);
    });

    it("Should be the right depositToken", async function () {
      const { strategy } = await loadFixture(deployStrategyFixture);

      expect(await strategy.getDepositToken()).to.equal(depositTokenAddress);
    });
  });

  describe("Deposit", function () {
    it("Should deposit contain correct amount of users deposited tokens", async function () {
      const { strategy, depositor, DepositToken, depositTokenInfo } = await loadFixture(deployStrategyFixture);

      const depositAmount = ethers.BigNumber.from(1).mul(depositTokenInfo.denominator);

      await DepositToken.connect(depositor).approve(strategy.address, depositAmount);
      await strategy.connect(depositor).deposit(depositAmount);

      const depositedTokenBalance = await strategy.userDepositedBalance(depositor.address, DepositToken.address);

      expect(depositedTokenBalance).to.equal(depositAmount);
    });

    it("Should deposit to the farm with allowable slippage", async function () {
      const { strategy, farm, depositor, DepositToken, depositTokenInfo } = await loadFixture(deployStrategyFixture);

      const depositAmount = ethers.BigNumber.from(1).mul(depositTokenInfo.denominator);

      await DepositToken.connect(depositor).approve(strategy.address, depositAmount);
      await strategy.connect(depositor).deposit(depositAmount);

      const calculatedAmountWithSlippage = await strategy.calculatePercentage(depositAmount, 10_000 - 50);
      const stakedStrategyInfo = await farm.userInfo(poolId, strategy.address);

      expect(calculatedAmountWithSlippage).to.lessThanOrEqual(stakedStrategyInfo.amount);
    });
  });

  describe("Validations", function () {
    it("Should revert with the right error if insufficient deposit token funds", async function () {
      const { strategy, depositTokenInfo } = await loadFixture(deployStrategyFixture);

      const depositAmount = ethers.BigNumber.from(1_000_000).mul(depositTokenInfo.denominator);

      await expect(strategy.deposit(depositAmount)).to.be.revertedWith(
        "Insufficient deposit token funds"
      );
    });
  });
});
