const CoinFlip = artifacts.require("CoinFlip");
const Hacker = artifacts.require("Hacker");

module.exports = function (_deployer, _network, [_, _hacker]) {
  // Use deployer to state migration tasks.
  _deployer.deploy(Hacker, { from: _hacker });
};
