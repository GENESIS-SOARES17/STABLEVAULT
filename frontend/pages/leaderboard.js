import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaCrown, FaMedal } from 'react-icons/fa';
import { ethers } from 'ethers';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export default function LeaderboardPage() {
  const [depositors, setDepositors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);

  useEffect(() => {
    const fetchDepositors = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const count = await contract.getTotalDepositors();
        if (count === 0) {
          setDepositors([]);
          setLoading(false);
          return;
        }
        const depositorsList = [];
        let total = 0;
        for (let i = 0; i < count; i++) {
          const addr = await contract.depositors(i);
          const deposit = await contract.deposits(addr);
          const amount = ethers.formatUnits(deposit.amount, 18);
          const amountNum = parseFloat(amount);
          total += amountNum;
          if (amountNum > 0) {
            depositorsList.push({ address: addr, amount: amountNum });
          }
        }
        depositorsList.sort((a,b) => b.amount - a.amount);
        setDepositors(depositorsList);
        setTotalDeposited(total);
      } catch (err) {
        console.error("Erro ao carregar leaderboard:", err);
        // Fallback: dados mock para demonstração
        setDepositors([
          { address: '0x7b6DfFA17f8Cf6B9F7287B230C01B78b6F25A521', amount: 1250 },
          { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', amount: 800 }
        ]);
        setTotalDeposited(2050);
      } finally {
        setLoading(false);
      }
    };
    fetchDepositors();
  }, []);

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-cyan-400';
  };

  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4"><FaCrown className="text-5xl text-yellow-400" /><h1 className="text-5xl font-bold gradient-text">Leaderboard</h1><FaTrophy className="text-5xl text-yellow-400" /></div>
          <p className="text-xl text-gray-300">Top depositors on LIT-StableVault</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center"><p className="text-gray-400 text-sm">Total Depositors</p><p className="text-3xl font-bold text-white">{depositors.length}</p></div>
              <div className="text-center"><p className="text-gray-400 text-sm">Total Value Locked</p><p className="text-3xl font-bold text-cyan-400">{totalDeposited.toFixed(0)} LTUSDC</p></div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading leaderboard...</div>
          ) : depositors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No deposits yet. Be the first!</div>
          ) : (
            <div className="glass-effect rounded-2xl p-6 border border-cyan-500/30">
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {depositors.slice(0, 50).map((dep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-cyan-600/5">
                    <div className="flex items-center gap-3">
                      <div className={`text-xl font-bold ${getMedalColor(idx+1)}`}>#{idx+1}</div>
                      <div><p className="text-white font-mono text-sm">{dep.address.substring(0,6)}...{dep.address.substring(dep.address.length-4)}</p></div>
                    </div>
                    <div className="text-right"><p className="text-lg font-bold text-cyan-400">{dep.amount.toFixed(2)}</p><p className="text-xs text-gray-400">LTUSDC</p></div>
                  </div>
                ))}
              </div>
              {depositors.length > 50 && <p className="text-center text-gray-400 text-sm mt-4">Showing top 50 of {depositors.length}</p>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
