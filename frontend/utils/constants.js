import stableVaultAbi from './stablevault-abi.json';
import stakeVaultAbi from './stakevault-abi.json';
import erc20Abi from './erc20-abi.json';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0";
export const STAKE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS || "0x0";
export const LTUSDC_ADDRESS = process.env.NEXT_PUBLIC_LTUSDC_ADDRESS || "0x5cCB920a9002740Af8F87dBeF52eF6394DD9bf35";

export const CONTRACT_ABI = stableVaultAbi;
export const STAKE_ABI = stakeVaultAbi;
export const ERC20_ABI = erc20Abi;
