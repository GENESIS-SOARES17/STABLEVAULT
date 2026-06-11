const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const LTUSDC_ADDRESS = process.env.LTUSDC_ADDRESS;
    const STABLE_VAULT = process.env.CONTRACT_ADDRESS;
    if (!LTUSDC_ADDRESS || !STABLE_VAULT) {
        console.error("❌ LTUSDC_ADDRESS ou CONTRACT_ADDRESS não definidos no .env");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);

    const ltusdc = await ethers.getContractAt("IERC20", LTUSDC_ADDRESS);
    const currentBalance = await ltusdc.balanceOf(STABLE_VAULT);
    console.log(`💰 Saldo atual do StableVault: ${ethers.formatUnits(currentBalance, 18)} LTUSDC`);

    // Meta: 3.000.000 LTUSDC
    const target = ethers.parseUnits("3000000", 18);
    if (currentBalance >= target) {
        console.log("✅ StableVault já possui 3 milhões ou mais. Nenhuma ação necessária.");
        return;
    }

    const missing = target - currentBalance;
    console.log(`📤 Transferindo ${ethers.formatUnits(missing, 18)} LTUSDC para o StableVault...`);

    const tx = await ltusdc.transfer(STABLE_VAULT, missing);
    await tx.wait();
    console.log(`✅ Transferência concluída! TX: ${tx.hash}`);

    const newBalance = await ltusdc.balanceOf(STABLE_VAULT);
    console.log(`💰 Novo saldo do StableVault: ${ethers.formatUnits(newBalance, 18)} LTUSDC`);
}

main().catch(console.error);
