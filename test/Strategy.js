const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Strategy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStrategyFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();
    const depositToken = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

    const Strategy = await ethers.getContractFactory("Strategy");
    const strategy = await Strategy.deploy();

    return { strategy, owner, depositToken };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { strategy, owner } = await loadFixture(deployStrategyFixture);

      expect(await strategy.owner()).to.equal(owner.address);
    });

    it("Should be the right depositToken", async function () {
        const { strategy, depositToken } = await loadFixture(deployStrategyFixture);

        expect(await strategy.getDepositToken()).to.equal(depositToken);
      });
  });

  describe("Deposit", function () {
    it("Should deposit the right owner", async function () {
    // const { strategy, owner } = await loadFixture(deployStrategyFixture);

    // expect(await strategy.userInfo(poolId, owner.address)).to.equal(owner.address);
    });
  });

  describe("Validations", function () {
    it("Should revert with the right error if insufficient deposit token funds", async function () {
      const { strategy } = await loadFixture(deployStrategyFixture);

      await expect(strategy.deposit(1000)).to.be.revertedWith(
        "Insufficient deposit token funds"
      );
    });
  });
});
