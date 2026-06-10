export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0";
export const STAKE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS || "0x0";
export const LTUSDC_ADDRESS = process.env.NEXT_PUBLIC_LTUSDC_ADDRESS || "0x5cCB920a9002740Af8F87dBeF52eF6394DD9bf35";

export const CONTRACT_ABI = [
  "function claimAirdrop()",
  "function mintLTUSDC() payable",
  "function deposit(uint256)",
  "function partialWithdraw(uint256)",
  "function withdraw()",
  "function getDepositInfo(address) view returns (uint256, uint256, uint256, uint256)",
  "function getTotalValueLocked() view returns (uint256)",
  "function getTotalDepositors() view returns (uint256)",
  "function getAirdropStatus(address) view returns (bool)",
  "function airdropAmount() view returns (uint256)",
  "function mintAmount() view returns (uint256)",
  "function mintFee() view returns (uint256)"
];

export const STAKE_ABI = [
  "function stake(uint256, uint256) returns (uint256)",
  "function unstake(uint256)",
  "function partialUnstake(uint256, uint256)",
  "function calculateInterest(uint256) view returns (uint256)",
  "function getUserActiveStakes(address) view returns ((uint256,address,uint256,uint256,uint256,uint256,bool)[])",
  "function getUserStakes(address) view returns ((uint256,address,uint256,uint256,uint256,uint256,bool)[])",
  "function getStakeInfo(uint256) view returns (uint256,address,uint256,uint256,uint256,uint256,bool)",
  "function getTotalStaked() view returns (uint256)",
  "function getTotalStakers() view returns (uint256)",
  "function ltusdc() view returns (address)"
];

export const ERC20_ABI = [
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address, address) view returns (uint256)"
];
