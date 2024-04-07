const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);

  // Deploy contracts
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);

  console.log("Contracts deployed:");
  console.log(`NFT: ${nft.address}`);
  console.log(`Marketplace: ${marketplace.address}`);

  // Save contract ABIs and addresses to the frontend directory
  saveFrontendFiles(marketplace, "Marketplace");
  saveFrontendFiles(nft, "NFT");
}

function saveFrontendFiles(contract, name) {
  const contractsDir = path.join(
    __dirname,
    "..",
    "src",
    "frontend",
    "contractsData"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const addressPath = path.join(contractsDir, `${name}-address.json`);
  fs.writeFileSync(
    addressPath,
    JSON.stringify({ address: contract.address }, null, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);
  const artifactPath = path.join(contractsDir, `${name}.json`);
  fs.writeFileSync(artifactPath, JSON.stringify(contractArtifact, null, 2));

  console.log(`${name} contract artifacts saved to ${contractsDir}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
