const CoinFlip = artifacts.require("CoinFlip");
const Hacker = artifacts.require("Hacker");
const { BN } = require("@openzeppelin/test-helpers");
const { expect, assert } = require("chai");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Hacker", function ([_, _hacker]) {
  let targetContract, hackerContract;

  beforeEach(async function () {
    targetContract = await CoinFlip.deployed();
    hackerContract = await Hacker.deployed();
  });

  context("should win always", async function () {
    for (let i = 0; i < 10; i++) {
      it("should win", async function () {
        const result = await hackerContract.attack(targetContract.address, { from: _hacker });
        expect(result.receipt.status).to.equal(true);
        const consecutiveWins = await targetContract.consecutiveWins();
        expect(consecutiveWins).to.be.bignumber.equal(new BN(i + 1));
      });
    }
  });
});
