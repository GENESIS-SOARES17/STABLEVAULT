import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FaLink, FaCopy, FaCheck, FaUsers, FaGift, FaTrophy } from 'react-icons/fa';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';

export default function Referrals() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    bonusEarned: 0,
    referrals: []
  });

  // Gera link de referência baseado no endereço da carteira
  const referralLink = address 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://lit-stablevault.vercel.app'}/?ref=${address}`
    : '';

  // Simulação: armazena referrals no localStorage
  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`referrals_${address}`);
    if (stored) {
      setReferralStats(JSON.parse(stored));
    } else {
      // Dados mock para demonstração (primeira vez)
      const mock = {
        totalReferrals: 2,
        activeReferrals: 1,
        bonusEarned: 50,
        referrals: [
          { id: 1, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', date: '2026-06-10', status: 'active', bonus: 50 },
          { id: 2, address: '0x8ba1f109551bD432803012645Hac136c30c6C2F', date: '2026-06-09', status: 'pending', bonus: 0 }
        ]
      };
      setReferralStats(mock);
      localStorage.setItem(`referrals_${address}`, JSON.stringify(mock));
    }
  }, [address]);

  // Ao carregar a página com parâmetro ?ref=..., registra a indicação (simulação)
  useEffect(() => {
    if (!address) return;
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref !== address) {
      // Simula que o usuário atual foi indicado pelo endereço 'ref'
      const storedRefs = localStorage.getItem(`referrals_${ref}`);
      if (storedRefs) {
        const data = JSON.parse(storedRefs);
        if (!data.referrals.some(r => r.address === address)) {
          data.referrals.push({
            id: Date.now(),
            address: address,
            date: new Date().toISOString().slice(0,10),
            status: 'active',
            bonus: 50
          });
          data.totalReferrals = data.referrals.length;
          data.activeReferrals = data.referrals.filter(r => r.status === 'active').length;
          data.bonusEarned += 50;
          localStorage.setItem(`referrals_${ref}`, JSON.stringify(data));
        }
      } else {
        const newData = {
          totalReferrals: 1,
          activeReferrals: 1,
          bonusEarned: 50,
          referrals: [{ id: Date.now(), address: address, date: new Date().toISOString().slice(0,10), status: 'active', bonus: 50 }]
        };
        localStorage.setItem(`referrals_${ref}`, JSON.stringify(newData));
      }
      // Remove o parâmetro da URL para não registrar novamente
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [address]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  if (!isConnected) {
    return (
      <Layout>
        <NewsTicker />
        <div className="container mx-auto px-4 py-12 text-center">
          <FaUsers className="text-4xl text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to access referrals</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4"><FaUsers className="text-5xl text-cyan-400" /><h1 className="text-5xl font-bold gradient-text">Referral Program</h1></div>
          <p className="text-xl text-gray-300">Invite friends and earn 50 LTUSDC each!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          <div className="glass-effect p-6 rounded-xl border border-cyan-500/30 text-center"><FaUsers className="text-cyan-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Total Referrals</p><p className="text-2xl font-bold text-white">{referralStats.totalReferrals}</p></div>
          <div className="glass-effect p-6 rounded-xl border border-purple-500/30 text-center"><FaTrophy className="text-purple-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Active Referrals</p><p className="text-2xl font-bold text-white">{referralStats.activeReferrals}</p></div>
          <div className="glass-effect p-6 rounded-xl border border-pink-500/30 text-center"><FaGift className="text-pink-400 text-3xl mx-auto mb-2" /><p className="text-gray-400 text-sm mb-1">Bonus Earned</p><p className="text-2xl font-bold text-white">{referralStats.bonusEarned} LTUSDC</p></div>
        </div>

        <div className="glass-effect rounded-2xl p-6 max-w-3xl mx-auto border border-cyan-500/30 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaLink className="text-cyan-400" /> Your Referral Link</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" value={referralLink} readOnly className="flex-1 px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono text-sm" />
            <button onClick={copyReferralLink} className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105'}`}>{copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy Link</>}</button>
          </div>
          <p className="text-sm text-gray-400 mt-3">Share this link – you'll earn <span className="text-cyan-400 font-bold">50 LTUSDC</span> for each active referral!</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 max-w-3xl mx-auto border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaUsers className="text-purple-400" /> Your Referrals</h3>
          {referralStats.referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p>No referrals yet. Share your link!</p></div>
          ) : (
            <div className="space-y-3">
              {referralStats.referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                  <div><p className="text-white font-mono text-sm">{ref.address.substring(0,6)}...{ref.address.substring(ref.address.length-4)}</p><p className="text-xs text-gray-400">{ref.date}</p></div>
                  <div className="text-right"><span className={`px-3 py-1 rounded-full text-xs font-bold ${ref.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>{ref.status.toUpperCase()}</span>{ref.bonus > 0 && <p className="text-xs text-cyan-400 mt-1">+{ref.bonus} LTUSDC</p>}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
