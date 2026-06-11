const { ethers } = require("ethers");

async function main() {
    const stableVault = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const ltusdc = process.env.NEXT_PUBLIC_LTUSDC_ADDRESS;

    if (!stableVault || !ltusdc) {
        console.error("❌ Variáveis de ambiente não carregadas.");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider("https://liteforge.rpc.caldera.xyz/http");
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const token = new ethers.Contract(ltusdc, abi, provider);
    
    const balance = await token.balanceOf(stableVault);
    console.log(`✅ Saldo do StableVault: ${ethers.formatUnits(balance, 18)} LTUSDC`);
}

main().catch(console.error);
