const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  require("dotenv").config();
  const LTUSDC_ADDRESS = process.env.LTUSDC_ADDRESS;
  if (!LTUSDC_ADDRESS) throw new Error("LTUSDC_ADDRESS not set");

  const MONTHLY_RATE_BPS = 500;
  const INITIAL_SUPPLY = ethers.parseUnits("2000000", 18);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const StakeVault = await ethers.getContractFactory("StakeVault");
  const vault = await StakeVault.deploy(LTUSDC_ADDRESS, MONTHLY_RATE_BPS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ StakeVault deployed to:", vaultAddress);

  const LTUSDC = await ethers.getContractAt("IERC20", LTUSDC_ADDRESS);
  const tx = await LTUSDC.transfer(vaultAddress, INITIAL_SUPPLY);
  await tx.wait();
  console.log("✅ StakeVault funded with", ethers.formatUnits(INITIAL_SUPPLY, 18), "LTUSDC");

  let env = fs.readFileSync(".env", "utf8");
  env = env.replace(/STAKE_CONTRACT_ADDRESS=.*/, "STAKE_CONTRACT_ADDRESS=" + vaultAddress);
  fs.writeFileSync(".env", env);
  console.log("💾 Stake contract address saved to .env");
}

main().catch(e => { console.error(e); process.exit(1); });
