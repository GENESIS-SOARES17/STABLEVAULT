const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.log("❌ CONTRACT_ADDRESS não definido");
    process.exit(1);
  }
  const abi = ["function dailyCheckin()"];
  const provider = new ethers.JsonRpcProvider("https://liteforge.rpc.caldera.xyz/http");
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    const fragment = contract.interface.getFunction("dailyCheckin");
    console.log("✅ dailyCheckin EXISTE no contrato!");
  } catch (e) {
    console.log("❌ dailyCheckin NÃO existe no contrato. Vamos reimplantar.");
    process.exit(2);
  }
}

main().catch(console.error);
