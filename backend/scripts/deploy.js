const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  require("dotenv").config();
  const LTUSDC_ADDRESS = process.env.LTUSDC_ADDRESS;
  if (!LTUSDC_ADDRESS) throw new Error("LTUSDC_ADDRESS not set in .env");

  const AIRDROP_AMOUNT = ethers.parseUnits("500", 18);
  const MINT_AMOUNT = ethers.parseUnits("100", 18);
  const MINT_FEE = ethers.parseEther("0.0001");
  const MONTHLY_RATE_BPS = 500;
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const StableVault = await ethers.getContractFactory("StableVault");
  const vault = await StableVault.deploy(
    LTUSDC_ADDRESS,
    AIRDROP_AMOUNT,
    MINT_AMOUNT,
    MINT_FEE,
    MONTHLY_RATE_BPS
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress(); // ✅ corrigido
  console.log("✅ StableVault deployed to:", vaultAddress);

  const LTUSDC = await ethers.getContractAt("IERC20", LTUSDC_ADDRESS);
  const tx = await LTUSDC.transfer(vaultAddress, INITIAL_SUPPLY);
  await tx.wait();
  console.log("✅ StableVault funded with", ethers.formatUnits(INITIAL_SUPPLY, 18), "LTUSDC");

  let env = fs.readFileSync(".env", "utf8");
  if (env.includes("CONTRACT_ADDRESS=")) {
    env = env.replace(/CONTRACT_ADDRESS=.*/, "CONTRACT_ADDRESS=" + vaultAddress);
  } else {
    env += "\nCONTRACT_ADDRESS=" + vaultAddress;
  }
  fs.writeFileSync(".env", env);
  console.log("💾 Contract address saved to .env");
}

main().catch(e => { console.error(e); process.exit(1); });
