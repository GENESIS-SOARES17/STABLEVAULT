import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { FaLock, FaCalendarAlt, FaPercentage, FaCoins, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';
import ConfirmModal from '../components/ConfirmModal';
import { STAKE_CONTRACT_ADDRESS, STAKE_ABI, LTUSDC_ADDRESS, ERC20_ABI } from '../utils/constants';
import { useToast } from '../components/Toast';

const EXPLORER_URL = 'https://liteforge.explorer.caldera.xyz/tx/';

export default function Staking() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [userStakes, setUserStakes] = useState([]);
  const [partialAmounts, setPartialAmounts] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'warning', stakeId: null, amount: null, isPartial: false });
  const { showToast } = useToast();

  const enabled = !!address && STAKE_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: balance, refetch: refetchBalance } = useReadContract({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'balanceOf', args: [address], query: { enabled } });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'allowance', args: [address, STAKE_CONTRACT_ADDRESS], query: { enabled } });
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'getTotalStaked', query: { enabled } });
  const { data: totalStakers, refetch: refetchTotalStakers } = useReadContract({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'getTotalStakers', query: { enabled } });

  const { writeContractAsync } = useWriteContract();

  const plans = [
    { days: 30, label: '30 Days', rate: 5.5, icon: '⚡' },
    { days: 60, label: '60 Days', rate: 6, icon: '💎' },
    { days: 90, label: '90 Days', rate: 7, icon: '👑' },
    { days: 180, label: '180 Days', rate: 9, icon: '🏆' }
  ];

  const fetchUserStakes = async () => {
    if (!address || !window.ethereum) return;
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(STAKE_CONTRACT_ADDRESS, STAKE_ABI, provider);
      const stakes = await contract.getUserActiveStakes(address);
      const formatted = stakes.map(s => ({ id: Number(s.id), amount: s.amount, stakeTime: Number(s.stakeTime), duration: Number(s.duration), rewardRate: Number(s.rewardRate), active: s.active }));
      setUserStakes(formatted);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isConnected) { fetchUserStakes(); const interval = setInterval(fetchUserStakes, 5000); return () => clearInterval(interval); } }, [isConnected, address]);

  const calculateInterest = (amountVal, days, rate) => (parseFloat(amountVal) * rate * days) / (30 * 100);

  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) { showToast('Enter a valid amount', 'warning'); return; }
    if (!selectedPlan) { showToast('Select a staking plan', 'warning'); return; }
    const interest = calculateInterest(amount, selectedPlan.days, selectedPlan.rate);
    setConfirmModal({ isOpen: true, title: 'Confirm Stake', message: `Stake ${amount} LTUSDC for ${selectedPlan.days} days?\n\nExpected interest: ${interest.toFixed(2)} LTUSDC\n\n⚠️ Early withdrawal: 50% penalty`, type: 'warning', stakeId: null, amount: null, isPartial: false });
  };

  const executeStake = async () => {
    try {
      setLoading(true);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setLastTxHash(null);
      const amountNum = parseFloat(amount);
      const allowanceNum = allowance ? Number(formatUnits(allowance, 18)) : 0;
      if (allowanceNum < amountNum) {
        showToast('Approving tokens...', 'info');
        const approveHash = await writeContractAsync({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [STAKE_CONTRACT_ADDRESS, parseUnits((amountNum * 2).toString(), 18)] });
        showToast(`Approved!`, 'success');
        setLastTxHash(approveHash);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await refetchAllowance();
      }
      const hash = await writeContractAsync({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'stake', args: [parseUnits(amount, 18), selectedPlan.days] });
      setLastTxHash(hash);
      showToast(`Staked ${amount} LTUSDC!`, 'success');
      setAmount('');
      setSelectedPlan(null);
      await Promise.all([refetchBalance(), fetchUserStakes(), refetchTotalStaked(), refetchTotalStakers()]);
    } catch (e) { showToast(`Error: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const handleWithdraw = (stakeId, stakeAmount, isPartial = false) => {
    const partialAmount = partialAmounts[stakeId];
    if (isPartial && (!partialAmount || parseFloat(partialAmount) <= 0)) { showToast('Enter a valid amount', 'warning'); return; }
    if (isPartial && parseFloat(partialAmount) > parseFloat(formatUnits(stakeAmount, 18))) { showToast('Amount exceeds stake', 'warning'); return; }
    setConfirmModal({ isOpen: true, title: isPartial ? 'Confirm Partial Withdraw' : 'Confirm Full Withdraw', message: isPartial ? `Withdraw ${partialAmount} LTUSDC from stake #${stakeId}?\n\n⚠️ If before deadline: 50% penalty on interest portion` : `Withdraw entire stake #${stakeId}?\n\n⚠️ If before deadline: 50% penalty on interest`, type: 'warning', stakeId, amount: isPartial ? partialAmount : null, isPartial });
  };

  const executeWithdraw = async () => {
    try {
      setLoading(true);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setLastTxHash(null);
      let hash;
      if (confirmModal.isPartial && confirmModal.amount) {
        hash = await writeContractAsync({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'partialUnstake', args: [confirmModal.stakeId, parseUnits(confirmModal.amount, 18)] });
        showToast(`Partial withdraw of ${confirmModal.amount} LTUSDC!`, 'success');
      } else {
        hash = await writeContractAsync({ address: STAKE_CONTRACT_ADDRESS, abi: STAKE_ABI, functionName: 'unstake', args: [confirmModal.stakeId] });
        showToast(`Stake #${confirmModal.stakeId} withdrawn!`, 'success');
      }
      setLastTxHash(hash);
      setPartialAmounts(prev => { const next = { ...prev }; delete next[confirmModal.stakeId]; return next; });
      await Promise.all([refetchBalance(), fetchUserStakes(), refetchTotalStaked(), refetchTotalStakers()]);
    } catch (e) { showToast(`Error: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const totalStakedValue = totalStaked ? parseFloat(formatUnits(totalStaked, 18)) : 0;
  const totalStakersValue = totalStakers ? Number(totalStakers) : 0;

  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4"><FaLock className="text-5xl text-cyan-400" /><h1 className="text-5xl font-bold gradient-text">Flexible Staking</h1></div>
          <p className="text-xl text-gray-300">Create multiple stakes - Withdraw anytime</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          <div className="glass-effect p-6 rounded-xl border border-cyan-500/30 text-center"><FaCoins className="text-cyan-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Total Staked</p><p className="text-2xl font-bold text-white">{totalStakedValue.toLocaleString()} LTUSDC</p></div>
          <div className="glass-effect p-6 rounded-xl border border-purple-500/30 text-center"><FaCalendarAlt className="text-purple-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Active Stakers</p><p className="text-2xl font-bold text-white">{totalStakersValue}</p></div>
          <div className="glass-effect p-6 rounded-xl border border-pink-500/30 text-center"><FaPercentage className="text-pink-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Best Rate</p><p className="text-2xl font-bold text-white">9% / month</p></div>
        </div>
        {!isConnected ? (
          <div className="text-center text-gray-400 py-20"><FaLock className="text-6xl mx-auto mb-4 opacity-50" /><p className="text-xl">Connect your wallet to start staking</p></div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-xl font-bold mb-4">Create New Stake</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {plans.map((plan) => (
                    <motion.button key={plan.days} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPlan(plan)} className={`p-4 rounded-lg border-2 transition-all ${selectedPlan?.days === plan.days ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30' : 'border-gray-700 bg-gray-900/30'}`}>
                      <div className="text-2xl mb-1">{plan.icon}</div><p className="font-bold text-white">{plan.label}</p><p className="text-cyan-400 text-sm">{plan.rate}% / month</p>
                    </motion.button>
                  ))}
                </div>
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg"><p className="text-sm text-gray-400">Balance:</p><p className="text-xl font-bold text-white">{balance ? parseFloat(formatUnits(balance,18)).toFixed(2) : '0'} LTUSDC</p></div>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full mb-4 px-4 py-3 bg-white border border-cyan-500/30 rounded-lg text-black font-semibold" />
                <button onClick={handleStake} disabled={!amount || parseFloat(amount)<=0 || !selectedPlan} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white disabled:opacity-50 hover:scale-105 transition-all">{loading ? 'Processing...' : 'Create Stake'}</button>
              </div>
              <div className="glass-effect rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/5">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-yellow-400"><FaExclamationTriangle /> How It Works</h4>
                <ul className="space-y-2 text-sm text-gray-300"><li>✅ Create UNLIMITED stakes</li><li>✅ Withdraw ANY stake at ANY time</li><li>✅ <span className="text-cyan-400 font-bold">PARTIAL withdraws</span> supported</li><li>• Early withdrawal: 50% penalty on interest</li><li>• After deadline: 100% interest</li></ul>
                {lastTxHash && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"><p className="text-green-400 text-sm mb-2 font-bold">✅ Success!</p><a href={`${EXPLORER_URL}${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm">View on Explorer</a></div>}
              </div>
            </div>
            <div className="glass-effect rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-6">Your Active Stakes ({userStakes.length})</h3>
              {userStakes.length === 0 ? <div className="text-center py-8 text-gray-400"><FaLock className="text-4xl mx-auto mb-3 opacity-50" /><p>No active stakes</p><p className="text-sm mt-2">Create your first stake above!</p></div> : (
                <div className="space-y-4">
                  {userStakes.map((stake) => {
                    const stakeAmount = parseFloat(formatUnits(stake.amount, 18));
                    const now = Math.floor(Date.now() / 1000);
                    const daysPassed = Math.floor((now - stake.stakeTime) / 86400);
                    const daysRemaining = Math.max(0, stake.duration - daysPassed);
                    const isUnlocked = daysRemaining === 0;
                    const interest = calculateInterest(stakeAmount, daysPassed, stake.rewardRate / 100);
                    const partialAmount = partialAmounts[stake.id] || '';
                    return (
                      <div key={stake.id} className={`p-5 rounded-xl border ${isUnlocked ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-bold">Stake #{stake.id}</span><span className={`text-xs px-2 py-1 rounded font-bold ${isUnlocked ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}</span></div><p className="text-white font-bold text-lg">{stakeAmount.toFixed(2)} LTUSDC</p><p className="text-xs text-gray-400">{stake.duration} days @ {stake.rewardRate/100}% / month</p><p className="text-sm text-cyan-400 mt-1">Interest: +{interest.toFixed(4)} LTUSDC</p>{!isUnlocked && <p className="text-xs text-yellow-400 mt-1">{daysRemaining} days left</p>}</div>
                            <button onClick={() => handleWithdraw(stake.id, stake.amount, false)} disabled={loading} className={`px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50 hover:scale-105 transition-all flex items-center gap-2 ${isUnlocked ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}><FaTrash /> Withdraw All</button>
                          </div>
                          <div className="pt-4 border-t border-gray-700"><p className="text-sm text-gray-400 mb-2">Partial Withdraw:</p><div className="flex gap-2"><input type="number" value={partialAmount} onChange={(e) => setPartialAmounts(prev => ({ ...prev, [stake.id]: e.target.value }))} placeholder={`Max: ${stakeAmount.toFixed(2)}`} className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm" max={stakeAmount} min="0" step="0.01" /><button onClick={() => handleWithdraw(stake.id, stake.amount, true)} disabled={loading || !partialAmount || parseFloat(partialAmount)<=0 || parseFloat(partialAmount)>stakeAmount} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white text-sm disabled:opacity-50">Withdraw Partial</button></div></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.stakeId ? executeWithdraw : executeStake} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={loading} />
    </Layout>
  );
}
