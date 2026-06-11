const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.log("❌ CONTRACT_ADDRESS não definido");
    process.exit(1);
  }
  const abi = ["function dailyCheckin()", "function lastCheckin(address) view returns (uint256)"];
  const provider = new ethers.JsonRpcProvider("https://liteforge.rpc.caldera.xyz/http");
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    await contract.dailyCheckin.staticCall(); // apenas para testar existência
    console.log("✅ dailyCheckin confirmado no contrato!");
  } catch (e) {
    if (e.message.includes("missing function")) {
      console.log("❌ dailyCheckin NÃO existe. Reimplantando...");
      process.exit(2);
    } else {
      console.log("⚠️ Erro inesperado:", e.message);
    }
  }
}
main().catch(console.error);
