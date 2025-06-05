// scripts/deployModRegistry.js
const hre = require("hardhat");

async function main() {
  const ModRegistry = await hre.ethers.getContractFactory("ModRegistry");
  const modRegistry = await ModRegistry.deploy();
  await modRegistry.waitForDeployment();
  const address = await modRegistry.getAddress();
  console.log("ModRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
