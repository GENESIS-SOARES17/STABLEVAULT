const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying LTUSDC with 10 billion supply...");
  const LTUSDC = await ethers.getContractFactory("LTUSDC");
  const ltusdc = await LTUSDC.deploy();
  await ltusdc.waitForDeployment();
  const address = await ltusdc.getAddress();
  console.log("✅ LTUSDC deployed to:", address);
  console.log("\n❗ Adicione este endereço ao .env como LTUSDC_ADDRESS");
}

main().catch(console.error);
