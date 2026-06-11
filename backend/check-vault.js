const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.log("❌ CONTRACT_ADDRESS não definido no .env");
    process.exit(1);
  }
  const abi = [
    "function airdropAmount() view returns (uint256)",
    "function mintAmount() view returns (uint256)",
    "function mintFee() view returns (uint256)"
  ];
  const contract = await ethers.getContractAt(abi, contractAddress);
  const airdrop = await contract.airdropAmount();
  const mintAmount = await contract.mintAmount();
  const mintFee = await contract.mintFee();
  console.log(`airdropAmount: ${ethers.formatUnits(airdrop, 18)} LTUSDC`);
  console.log(`mintAmount: ${ethers.formatUnits(mintAmount, 18)} LTUSDC`);
  console.log(`mintFee: ${ethers.formatEther(mintFee)} zkLTC`);
}

main().catch(console.error);
