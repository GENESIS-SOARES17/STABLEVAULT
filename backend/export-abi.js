const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.log("❌ CONTRACT_ADDRESS não definido");
    process.exit(1);
  }
  const artifact = await artifacts.readArtifact("StableVault");
  const fullAbi = artifact.abi;
  // Salva como JSON para o frontend
  fs.writeFileSync("../frontend/utils/stablevault-abi.json", JSON.stringify(fullAbi, null, 2));
  console.log("✅ ABI do StableVault salva em frontend/utils/stablevault-abi.json");
  // Também salva para StakeVault
  const stakeArtifact = await artifacts.readArtifact("StakeVault");
  fs.writeFileSync("../frontend/utils/stakevault-abi.json", JSON.stringify(stakeArtifact.abi, null, 2));
  console.log("✅ ABI do StakeVault salva.");
}

main().catch(console.error);
