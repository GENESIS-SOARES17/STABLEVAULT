import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
import Link from 'next/link';
import Image from 'next/image';
import { FaCoins, FaChartLine, FaHistory, FaGift, FaExternalLinkAlt, FaLock, FaPiggyBank } from 'react-icons/fa';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';
import { CONTRACT_ADDRESS, CONTRACT_ABI, STAKE_CONTRACT_ADDRESS, STAKE_ABI } from '../utils/constants';
import { useToast } from '../components/Toast';

const EXPLORER_URL = 'https://liteforge.explorer.caldera.xyz/tx/';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [activeTab, setActiveTab] = useState('airdrop');
  const { showToast } = useToast();

  const enabled = !!address && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: airdropAmount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'airdropAmount', query: { enabled } });
  const { data: mintAmount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'mintAmount', query: { enabled } });
  const { data: mintFee } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'mintFee', query: { enabled } });
  const { data: hasClaimed } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getAirdropStatus', args: [address], query: { enabled } });
  const { data: poolTVL } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalValueLocked', query: { enabled: !!CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0" } });
  const { data: poolUsers } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalDepositors', query: { enabled: !!CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0" } });
  const { data: stakeTVL } = useReadContract({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'getTotalStaked', query: { enabled: !!STAKE_CONTRACT_ADDRESS && STAKE_CONTRACT_ADDRESS !== "0x0" } });
  const { data: stakeUsers } = useReadContract({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'getTotalStakers', query: { enabled: !!STAKE_CONTRACT_ADDRESS && STAKE_CONTRACT_ADDRESS !== "0x0" } });

  const { writeContractAsync } = useWriteContract();

  const handleClaimAirdrop = async () => {
    try { setLoading(true); setLastTxHash(null); const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'claimAirdrop' }); setLastTxHash(hash); showToast(`Airdrop de 500 LTUSDC recebido!`, 'success'); } catch (e) { showToast(`Erro: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const handleMint = async () => {
    try { setLoading(true); setLastTxHash(null); const fee = mintFee || parseEther('0.0001'); const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'mintLTUSDC', value: fee }); setLastTxHash(hash); showToast(`Mintado 100 LTUSDC!`, 'success'); } catch (e) { showToast(`Erro: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const airdropValue = airdropAmount ? formatUnits(airdropAmount, 18) : '500';
  const mintValue = mintAmount ? formatUnits(mintAmount, 18) : '100';
  const feeValue = mintFee ? formatUnits(mintFee, 18) : '0.0001';
  const alreadyClaimed = hasClaimed || false;

  const poolTVLValue = poolTVL ? parseFloat(formatUnits(poolTVL, 18)) : 0;
  const poolUsersValue = poolUsers ? Number(poolUsers) : 0;
  const stakeTVLValue = stakeTVL ? parseFloat(formatUnits(stakeTVL, 18)) : 0;
  const stakeUsersValue = stakeUsers ? Number(stakeUsers) : 0;
  const totalTVL = poolTVLValue + stakeTVLValue;

  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6"><div className="relative h-24 w-[600px]"><Image src="/assets/images/titulo.png" alt="LIT-StableVault" fill className="object-contain" priority /></div></div>
          <p className="text-2xl text-gray-300 mb-4">Interest Pool with Airdrop + Unlimited Minting</p>
          <p className="text-lg text-cyan-400/80 max-w-2xl mx-auto">Ganhe {airdropValue} LTUSDC GRÁTIS na primeira conexão, depois minte {mintValue} LTUSDC por apenas {feeValue} zkLTC!</p>
        </div>
        <div className="max-w-6xl mx-auto mb-12">
          <div className="glass-effect rounded-2xl p-8 border border-cyan-500/30 mb-6">
            <h2 className="text-3xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>📊 Protocol Statistics</h2>
            <div className="text-center mb-8"><p className="text-gray-400 text-sm mb-2">Total Value Locked (TVL)</p><p className="text-5xl font-bold gradient-text mb-2">{totalTVL.toLocaleString()} LTUSDC</p><p className="text-sm text-gray-500">Across all pools and staking</p></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5"><div className="flex items-center gap-3 mb-4"><FaPiggyBank className="text-3xl text-cyan-400" /><h3 className="text-xl font-bold">Interest Pool</h3></div><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-400">Locked:</span><span className="text-2xl font-bold text-cyan-400">{poolTVLValue.toLocaleString()} LTUSDC</span></div><div className="flex justify-between"><span className="text-gray-400">Users:</span><span className="text-xl font-bold text-white">{poolUsersValue}</span></div><div className="flex justify-between"><span className="text-gray-400">Rate:</span><span className="text-xl font-bold text-green-400">5% / month</span></div></div><Link href="/pool"><button className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-all">View Pool →</button></Link></div>
              <div className="p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5"><div className="flex items-center gap-3 mb-4"><FaLock className="text-3xl text-purple-400" /><h3 className="text-xl font-bold">Flexible Staking</h3></div><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-400">Staked:</span><span className="text-2xl font-bold text-purple-400">{stakeTVLValue.toLocaleString()} LTUSDC</span></div><div className="flex justify-between"><span className="text-gray-400">Stakers:</span><span className="text-xl font-bold text-white">{stakeUsersValue}</span></div><div className="flex justify-between"><span className="text-gray-400">Best Rate:</span><span className="text-xl font-bold text-green-400">9% / month</span></div></div><Link href="/staking"><button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white hover:scale-105 transition-all">View Staking →</button></Link></div>
            </div>
          </div>
        </div>
        {isConnected && enabled && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-effect rounded-2xl p-8 card-hover border border-cyan-500/30">
              <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('airdrop')} className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'airdrop' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}><FaGift /> Airdrop</button>
                <button onClick={() => setActiveTab('mint')} className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'mint' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}><FaCoins /> Mint</button>
              </div>
              {activeTab === 'airdrop' && (<div className="text-center"><FaGift className="text-6xl text-purple-400 mx-auto mb-4" /><h2 className="text-3xl font-bold mb-2">Welcome Airdrop</h2><p className="text-5xl font-bold text-purple-400 mb-4">{airdropValue} LTUSDC</p><p className="text-gray-400 mb-4">{alreadyClaimed ? '✅ You already claimed this airdrop' : 'FREE for first-time users!'}</p><button onClick={handleClaimAirdrop} disabled={loading || alreadyClaimed} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all">{loading ? 'Processing...' : alreadyClaimed ? 'Already Claimed' : 'Claim Free Airdrop'}</button></div>)}
              {activeTab === 'mint' && (<div className="text-center"><FaCoins className="text-6xl text-cyan-400 mx-auto mb-4" /><h2 className="text-3xl font-bold mb-2">Unlimited Mint</h2><p className="text-5xl font-bold text-cyan-400 mb-4">{mintValue} LTUSDC</p><p className="text-gray-400 mb-4">Fee: {feeValue} zkLTC per mint</p><button onClick={handleMint} disabled={loading} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white text-lg disabled:opacity-50 hover:scale-105 transition-all btn-glow-cyan">{loading ? 'Processing...' : `Mint ${mintValue} LTUSDC`}</button></div>)}
              {lastTxHash && (<div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"><p className="text-green-400 text-sm mb-2 font-bold">✅ Transaction Successful!</p><a href={`${EXPLORER_URL}${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"><FaExternalLinkAlt size={12} /> View on Explorer <span className="font-mono text-xs opacity-70">{lastTxHash.substring(0,6)}...{lastTxHash.substring(lastTxHash.length-4)}</span></a></div>)}
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/pool" className="glass-effect rounded-xl p-6 card-hover block border border-cyan-500/30"><FaChartLine className="text-4xl text-cyan-400 mb-4" /><h3 className="text-2xl font-bold mb-2">Interest Pool</h3><p className="text-gray-400">Deposit and earn 5% monthly interest with real-time tracking.</p></Link>
          <Link href="/history" className="glass-effect rounded-xl p-6 card-hover block border border-pink-500/30"><FaHistory className="text-4xl text-pink-500 mb-4" /><h3 className="text-2xl font-bold mb-2">History</h3><p className="text-gray-400">View transactions and accumulated interest over time.</p></Link>
        </div>
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center"><p className="text-yellow-300 text-sm">⚠️ <strong>TESTNET ONLY:</strong> All assets have ZERO real-world value. This is an educational demo.</p></div>
      </div>
    </Layout>
  );
}
