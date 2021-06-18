const CoinFlip = artifacts.require("CoinFlip");

module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  _deployer.deploy(CoinFlip);
};
