require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    chainstack: {
      url: "https://ethereum-sepolia.core.chainstack.com/a52b1307c7a591ca9de66865034c9a32",
      accounts: [
        "2c52f1157ccb6ee5b67aec3cda82c6db93db4294544499024e981ceb3cafc456",
      ],
    },
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test",
  },
};
