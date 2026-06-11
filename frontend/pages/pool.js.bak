import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { FaPiggyBank, FaChartLine, FaClock, FaCoins, FaExclamationTriangle } from 'react-icons/fa';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';
import { CONTRACT_ADDRESS, CONTRACT_ABI, LTUSDC_ADDRESS, ERC20_ABI } from '../utils/constants';
import { useToast } from '../components/Toast';

const EXPLORER_URL = 'https://liteforge.explorer.caldera.xyz/tx/';

export default function Pool() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const { showToast } = useToast();

  const enabled = !!address && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: balance, refetch: refetchBalance } = useReadContract({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'balanceOf', args: [address], query: { enabled, refetchInterval: 10000 } });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'allowance', args: [address, CONTRACT_ADDRESS], query: { enabled, refetchInterval: 10000 } });
  const { data: depositInfo, refetch: refetchDeposit } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getDepositInfo', args: [address], query: { enabled, refetchInterval: 10000 } });
  const { data: totalValueLocked, refetch: refetchTVL } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalValueLocked', query: { enabled, refetchInterval: 10000 } });
  const { data: totalDepositors, refetch: refetchDepositors } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalDepositors', query: { enabled, refetchInterval: 10000 } });

  const { writeContractAsync } = useWriteContract();

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) { showToast('Enter a valid amount', 'warning'); return; }
    try {
      setLoading(true); setLastTxHash(null);
      const amountNum = parseFloat(depositAmount);
      const allowanceNum = allowance ? Number(formatUnits(allowance, 18)) : 0;
      if (allowanceNum < amountNum) {
        showToast('Approving LTUSDC...', 'info');
        const approveHash = await writeContractAsync({ address: LTUSDC_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [CONTRACT_ADDRESS, parseUnits((amountNum * 2).toString(), 18)] });
        showToast(`Approved!`, 'success');
        setLastTxHash(approveHash);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await refetchAllowance();
      }
      const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'deposit', args: [parseUnits(depositAmount, 18)] });
      setLastTxHash(hash);
      showToast(`Deposited ${depositAmount} LTUSDC!`, 'success');
      setDepositAmount('');
      await Promise.all([refetchBalance(), refetchDeposit(), refetchTVL(), refetchDepositors()]);
    } catch (e) { showToast(`Error: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const handlePartialWithdraw = async () => {
    if (!depositInfo || Number(depositInfo[0]) === 0) { showToast('No deposit found', 'warning'); return; }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) { showToast('Enter a valid amount', 'warning'); return; }
    const principal = Number(formatUnits(depositInfo[0], 18));
    if (parseFloat(withdrawAmount) > principal) { showToast('Amount exceeds deposit', 'warning'); return; }
    try {
      setLoading(true); setLastTxHash(null);
      const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'partialWithdraw', args: [parseUnits(withdrawAmount, 18)] });
      setLastTxHash(hash);
      showToast(`Withdrew ${withdrawAmount} LTUSDC!`, 'success');
      setWithdrawAmount('');
      await Promise.all([refetchBalance(), refetchDeposit(), refetchTVL(), refetchDepositors()]);
    } catch (e) { showToast(`Error: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const handleFullWithdraw = async () => {
    if (!depositInfo || Number(depositInfo[0]) === 0) { showToast('No deposit found', 'warning'); return; }
    try {
      setLoading(true); setLastTxHash(null);
      const hash = await writeContractAsync({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'withdraw', args: [] });
      setLastTxHash(hash);
      showToast(`Withdrawn successfully!`, 'success');
      await Promise.all([refetchBalance(), refetchDeposit(), refetchTVL(), refetchDepositors()]);
    } catch (e) { showToast(`Error: ${e.shortMessage || e.message}`, 'error'); } finally { setLoading(false); }
  };

  const principal = depositInfo ? parseFloat(formatUnits(depositInfo[0], 18)) : 0;
  const interest = depositInfo ? parseFloat(formatUnits(depositInfo[1], 18)) : 0;
  const total = principal + interest;
  const tvl = totalValueLocked ? parseFloat(formatUnits(totalValueLocked, 18)) : 0;
  const depositors = totalDepositors ? Number(totalDepositors) : 0;

  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4"><FaPiggyBank className="text-5xl text-cyan-400" /><h1 className="text-5xl font-bold gradient-text">Interest Pool</h1></div>
          <p className="text-xl text-gray-300">Earn 5% monthly interest with flexible withdrawal</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          <div className="glass-effect p-6 rounded-xl border border-cyan-500/30 text-center"><FaChartLine className="text-cyan-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Total Value Locked</p><p className="text-2xl font-bold text-white">{tvl.toLocaleString()} LTUSDC</p></div>
          <div className="glass-effect p-6 rounded-xl border border-purple-500/30 text-center"><FaCoins className="text-purple-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Active Depositors</p><p className="text-2xl font-bold text-white">{depositors}</p></div>
          <div className="glass-effect p-6 rounded-xl border border-pink-500/30 text-center"><FaClock className="text-pink-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Interest Rate</p><p className="text-2xl font-bold text-white">5% / month</p></div>
        </div>
        {!isConnected ? (
          <div className="text-center text-gray-400 py-20"><FaPiggyBank className="text-6xl mx-auto mb-4 opacity-50" /><p className="text-xl">Connect your wallet to start earning</p></div>
        ) : (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-xl font-bold mb-4">Deposit to Pool</h3>
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg"><p className="text-sm text-gray-400">Available Balance:</p><p className="text-xl font-bold text-white">{balance ? parseFloat(formatUnits(balance,18)).toFixed(2) : '0'} LTUSDC</p></div>
                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" className="w-full mb-4 px-4 py-3 bg-white border border-cyan-500/30 rounded-lg text-black font-semibold" />
                <button onClick={handleDeposit} disabled={loading || !depositAmount || parseFloat(depositAmount)<=0} className="w-full btn-primary disabled:opacity-50 btn-glow-cyan">{loading ? 'Processing...' : 'Deposit'}</button>
              </div>
              <div className="glass-effect rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/5">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-yellow-400"><FaExclamationTriangle /> How It Works</h4>
                <ul className="space-y-2 text-sm text-gray-300"><li>✅ Deposit any amount of LTUSDC</li><li>✅ Earn 5% interest monthly</li><li>✅ <span className="text-cyan-400 font-bold">Partial withdrawals</span> supported</li><li>✅ Withdraw anytime without penalty</li><li>• Interest accrues in real-time</li></ul>
                {lastTxHash && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"><p className="text-green-400 text-sm mb-2 font-bold">✅ Success!</p><a href={`${EXPLORER_URL}${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm">View on Explorer</a></div>}
              </div>
            </div>
            <div className="glass-effect rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-6">Your Deposit</h3>
              {principal === 0 ? (
                <div className="text-center py-12 text-gray-400"><FaPiggyBank className="text-6xl mx-auto mb-4 opacity-50" /><p className="text-xl">No active deposit</p><p className="text-sm mt-2">Make a deposit to start earning interest!</p></div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg"><span className="text-gray-400">Principal:</span><span className="text-white font-bold text-lg">{principal.toFixed(2)} LTUSDC</span></div>
                    <div className="flex justify-between p-3 bg-cyan-500/10 rounded-lg"><span className="text-gray-400">Accumulated Interest:</span><span className="text-cyan-400 font-bold text-lg">+{interest.toFixed(4)} LTUSDC</span></div>
                    <div className="flex justify-between p-3 bg-green-500/10 rounded-lg"><span className="text-gray-400">Total Value:</span><span className="text-green-400 font-bold text-xl">{total.toFixed(4)} LTUSDC</span></div>
                  </div>
                  <div className="pt-4 border-t border-gray-700"><h4 className="text-sm font-bold text-gray-400 mb-3">Partial Withdraw:</h4><div className="flex gap-2 mb-3"><input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder={`Max: ${principal.toFixed(2)}`} className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white" max={principal} min="0" step="0.01" /><button onClick={handlePartialWithdraw} disabled={loading || !withdrawAmount || parseFloat(withdrawAmount)<=0 || parseFloat(withdrawAmount)>principal} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white disabled:opacity-50 hover:scale-105 transition-all">Withdraw Partial</button></div></div>
                  <button onClick={handleFullWithdraw} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white hover:scale-105 transition-all">{loading ? 'Processing...' : 'Withdraw All'}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
