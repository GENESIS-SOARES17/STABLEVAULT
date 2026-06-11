import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { FaCalendarCheck, FaClock } from 'react-icons/fa';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';
import { useToast } from './Toast';

export default function DailyCheckin() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const { showToast } = useToast();

  const { data: lastCheckin, refetch: refetchLast } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'lastCheckin',
    args: [address],
    query: { enabled: isConnected && !!address }
  });

  const { data: rewardAmount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'dailyRewardAmount',
    query: { enabled: true }
  });

  const { writeContractAsync } = useWriteContract();

  const canClaim = () => {
    if (!lastCheckin) return true;
    const last = Number(lastCheckin);
    const now = Math.floor(Date.now() / 1000);
    return now >= last + 86400;
  };

  const getTimeUntilNext = () => {
    if (!lastCheckin || canClaim()) return null;
    const last = Number(lastCheckin);
    const next = last + 86400;
    const now = Math.floor(Date.now() / 1000);
    const diff = next - now;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastCheckin && !canClaim()) {
        setTimeLeft(getTimeUntilNext());
      } else {
        setTimeLeft(null);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastCheckin]);

  const handleCheckin = async () => {
    console.log("🔵 Daily checkin button clicked");
    if (!canClaim()) {
      showToast(`Already claimed today. Next in ${timeLeft}`, 'info');
      return;
    }
    try {
      setLoading(true);
      console.log("🔵 Calling dailyCheckin on contract:", CONTRACT_ADDRESS);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'dailyCheckin'
      });
      console.log("✅ Transaction hash:", hash);
      showToast(`🎉 You received ${formatUnits(rewardAmount || parseUnits('100', 18), 18)} LTUSDC!`, 'success');
      await refetchLast();
    } catch (e) {
      console.error("❌ Daily checkin error:", e);
      showToast(`Error: ${e.shortMessage || e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) return null;

  const claimed = !canClaim();
  const rewardValue = rewardAmount ? formatUnits(rewardAmount, 18) : '100';

  return (
    <div className="glass-effect rounded-2xl p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
      <div className="flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <FaCalendarCheck className="text-4xl text-yellow-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Daily Check-in</h3>
            <p className="text-sm text-gray-300">Claim {rewardValue} LTUSDC every day!</p>
          </div>
        </div>
        <button
          onClick={handleCheckin}
          disabled={loading || claimed}
          className={`px-8 py-3 rounded-lg font-bold transition-all ${
            claimed
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 shadow-lg shadow-yellow-500/50'
          }`}
        >
          {loading ? 'Processing...' : claimed ? (timeLeft ? `Next in ${timeLeft}` : 'Already claimed') : '🎁 GM / GN - Claim 100 LTUSDC'}
        </button>
      </div>
      {claimed && timeLeft && (
        <div className="mt-3 text-sm text-yellow-400 flex items-center gap-2">
          <FaClock /> Come back in {timeLeft}
        </div>
      )}
    </div>
  );
}
