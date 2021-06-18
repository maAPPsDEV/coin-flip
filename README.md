# Solidity game - Coin Flip, Never Lose

_Inspired by OpenZeppelin's [Ethernaut](https://ethernaut.openzeppelin.com/level/0x4dF32584890A0026e56f7535d0f2C6486753624f), Coin Flip Level_

⚠️Do not try on mainnet!

## Task

This is a coin flipping game where you need to build up your winning streak by guessing the outcome of a coin flip. You'll need to use your psychic abilities to guess the correct outcome 10 times in a row.

1. Win more than 10 times in a row

_Hint:_

1. You can get the same `blockhash` when you call it inside your contract.

## What will you learn?

1. Random number generated in Ethereum is vulnerable.
2. How to get the secure random number.

## What is the most difficult challenge?

**Simulate target contract, thus predict the result.**

In `CoinFlip` contract, the seed of the random number is the number of previous mined block.
So, you need to predict the block number in order to win. Of course, you can if you have a psychic abilities. 🦸
In other way, you can make a contract then make it call `flip` function of the target contract. At the moment, the block number is the same both in your contract and target contract.

**Random number generation via `keccak256`**

The best source of randomness we have in Solidity is the `keccak256` hash function.

We could do something like the following to generate a random number:

```
// Generate a random number between 1 and 100:
uint randNonce = 0;
uint random = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 100;
randNonce++;
uint random2 = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 100;
```

What this would do is take the timestamp of `now`, the `msg.sender`, and an incrementing `nonce` (a number that is only ever used once, so we don't run the same hash function with the same input parameters twice).

It would then "pack" the inputs and use `keccak` to convert them to a random hash. Next, it would convert that hash to a `uint`, and then use `% 100` to take only the last 2 digits. This will give us a totally random number between 0 and 99.

Awesome! 😄

But wait...
This method is vulnerable to attack by a dishonest node
In Ethereum, when you call a function on a contract, you broadcast it to a node or nodes on the network as a **transaction**. The nodes on the network then collect a bunch of transactions, try to be the first to solve a computationally-intensive mathematical problem as a "Proof of Work", and then publish that group of transactions along with their Proof of Work (PoW) as a **block** to the rest of the network.

Once a node has solved the PoW, the other nodes stop trying to solve the PoW, verify that the other node's list of transactions are valid, and then accept the block and move on to trying to solve the next block.

This makes our random number function exploitable.

Let's say we had a coin flip contract — heads you double your money, tails you lose everything. Let's say it used the above random function to determine heads or tails. (`random >= 50` is heads, `random < 50` is tails).

If I were running a node, I could publish a transaction only to my own node and not share it. I could then run the coin flip function to see if I won — and if I lost, choose not to include that transaction in the next block I'm solving. I could keep doing this indefinitely until I finally won the coin flip and solved the next block, and profit.

**So how do we generate random numbers safely in Ethereum?** 😢

Because the entire contents of the blockchain are visible to all participants, this is a hard problem. You can read [this StackOverflow thread](https://ethereum.stackexchange.com/questions/191/how-can-i-securely-generate-a-random-number-in-my-smart-contract) for some ideas. One idea would be to use an **oracle** to access a random number function from outside of the Ethereum blockchain.

[Predicting Random Numbers in Ethereum Smart Contracts](https://blog.positive.com/predicting-random-numbers-in-ethereum-smart-contracts-e5358c6b8620)

[How can I securely generate a random number in my smart contract?](https://ethereum.stackexchange.com/questions/191/how-can-i-securely-generate-a-random-number-in-my-smart-contract)

## Source Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.5 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CoinFlip {
  using SafeMath for uint256;
  uint256 public consecutiveWins;
  uint256 lastHash;
  uint256 FACTOR =
    57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor() {
    consecutiveWins = 0;
  }

  function flip(bool _guess) public returns (bool) {
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;

    if (side == _guess) {
      consecutiveWins++;
      return true;
    } else {
      consecutiveWins = 0;
      return false;
    }
  }
}

```

## Configuration

### Install Truffle cli

_Skip if you have already installed._

```
npm install -g truffle
```

### Install Dependencies

```
yarn install
```

## Test and Attack!💥

### Run Tests

```
yarn test
```

You should see you won 10 times in a row.

```
truffle(development)> test
Using network 'development'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



  Contract: Hacker
    should win always
      √ should win (471ms)
      √ should win (525ms)
      √ should win (451ms)
      √ should win (479ms)
      √ should win (502ms)
      √ should win (471ms)
      √ should win (471ms)
      √ should win (500ms)
      √ should win (605ms)
      √ should win (547ms)


  10 passing (5s)
```
