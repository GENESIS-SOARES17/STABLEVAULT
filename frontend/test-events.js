const { ethers } = require("ethers");
require('dotenv').config({ path: '../backend/.env' });
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0";
const RPC = "https://liteforge.rpc.caldera.xyz/http";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const abi = [
    "event AirdropClaimed(address indexed user, uint256 amount)",
    "event Deposited(address indexed user, uint256 amount)",
    "event Withdrawn(address indexed user, uint256 principal, uint256 interest)",
    "event PartialWithdrawn(address indexed user, uint256 amount, uint256 interest, uint256 remainingAmount)",
    "event Minted(address indexed user, uint256 amount, uint256 fee)"
  ];
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  const filter = contract.filters.AirdropClaimed();
  const events = await contract.queryFilter(filter, -10000);
  console.log(`Eventos AirdropClaimed encontrados: ${events.length}`);
  if (events.length > 0) console.log("Primeiro evento:", events[0]);
}
main().catch(console.error);
