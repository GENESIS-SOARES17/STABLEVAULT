import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { FaHistory, FaCoins, FaChartLine } from 'react-icons/fa';
import Layout from '../components/Layout';
import NewsTicker from '../components/NewsTicker';
import TransactionTimeline from '../components/TransactionTimeline';
import { CONTRACT_ADDRESS, CONTRACT_ABI, STAKE_CONTRACT_ADDRESS, STAKE_ABI } from '../utils/constants';

export default function History() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar eventos reais (tentativa)
  const fetchRealEvents = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const stableVault = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const stakeVault = new ethers.Contract(STAKE_CONTRACT_ADDRESS, STAKE_ABI, provider);
      
      // Tentar buscar eventos dos últimos 1000 blocos (ou desde o início se limitado)
      const fromBlock = -5000;
      const events = [];
      
      // Eventos do StableVault
      const airdropFilter = stableVault.filters.AirdropClaimed(address);
      const depositFilter = stableVault.filters.Deposited(address);
      const withdrawFilter = stableVault.filters.Withdrawn(address);
      const partialFilter = stableVault.filters.PartialWithdrawn(address);
      const mintFilter = stableVault.filters.Minted(address);
      
      const [airdrop, deposits, withdraws, partials, mints] = await Promise.all([
        stableVault.queryFilter(airdropFilter, fromBlock),
        stableVault.queryFilter(depositFilter, fromBlock),
        stableVault.queryFilter(withdrawFilter, fromBlock),
        stableVault.queryFilter(partialFilter, fromBlock),
        stableVault.queryFilter(mintFilter, fromBlock),
      ]);
      
      airdrop.forEach(e => events.push({
        id: e.transactionHash,
        type: 'airdrop',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      deposits.forEach(e => events.push({
        id: e.transactionHash + '-deposit',
        type: 'deposit',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      withdraws.forEach(e => events.push({
        id: e.transactionHash + '-withdraw',
        type: 'withdraw',
        amount: ethers.formatUnits(e.args.principal, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      partials.forEach(e => events.push({
        id: e.transactionHash + '-partial',
        type: 'partialWithdraw',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      mints.forEach(e => events.push({
        id: e.transactionHash + '-mint',
        type: 'mint',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      
      // Eventos do StakeVault
      const stakeFilter = stakeVault.filters.Staked(address);
      const unstakeFilter = stakeVault.filters.Unstaked(address);
      const partialUnstakeFilter = stakeVault.filters.PartialUnstaked(address);
      
      const [stakes, unstakes, partialUnstakes] = await Promise.all([
        stakeVault.queryFilter(stakeFilter, fromBlock),
        stakeVault.queryFilter(unstakeFilter, fromBlock),
        stakeVault.queryFilter(partialUnstakeFilter, fromBlock)
      ]);
      
      stakes.forEach(e => events.push({
        id: e.transactionHash + '-stake',
        type: 'stake',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      unstakes.forEach(e => events.push({
        id: e.transactionHash + '-unstake',
        type: 'unstake',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      partialUnstakes.forEach(e => events.push({
        id: e.transactionHash + '-partialUnstake',
        type: 'partialUnstake',
        amount: ethers.formatUnits(e.args.amount, 18),
        date: new Date(Number(e.block.timestamp) * 1000).toLocaleString(),
        hash: e.transactionHash
      }));
      
      events.sort((a,b) => new Date(b.date) - new Date(a.date));
      return events;
    } catch (err) {
      console.error("Erro ao buscar eventos reais:", err);
      return null;
    }
  };
  
  // Fallback: simular transações baseadas no localStorage (para demonstração)
  const getMockTransactions = () => {
    const stored = localStorage.getItem(`history_${address}`);
    if (stored) return JSON.parse(stored);
    // Mock inicial (exemplo)
    const mock = [
      { id: '1', type: 'airdrop', amount: '1000.00', date: new Date().toLocaleString(), hash: '0xmock1' },
      { id: '2', type: 'deposit', amount: '500.00', date: new Date().toLocaleString(), hash: '0xmock2' }
    ];
    localStorage.setItem(`history_${address}`, JSON.stringify(mock));
    return mock;
  };
  
  // Salvar nova transação no localStorage (para simulação)
  const addTransaction = (type, amount) => {
    const existing = getMockTransactions();
    const newTx = { id: Date.now().toString(), type, amount: amount.toString(), date: new Date().toLocaleString(), hash: '0xsimulated' };
    existing.unshift(newTx);
    localStorage.setItem(`history_${address}`, JSON.stringify(existing));
    setTransactions(existing);
  };
  
  // Expor função para ser chamada após ações (depósito, saque, etc.)
  useEffect(() => {
    if (!isConnected || !address) return;
    const load = async () => {
      setLoading(true);
      const realEvents = await fetchRealEvents();
      if (realEvents && realEvents.length > 0) {
        setTransactions(realEvents);
      } else {
        // Fallback para simulação
        const mock = getMockTransactions();
        setTransactions(mock);
      }
      setLoading(false);
    };
    load();
  }, [address, isConnected]);
  
  // Para integração com outras páginas (ex: ao fazer deposit, chamar addTransaction)
  if (typeof window !== 'undefined') {
    window.__addHistoryTransaction = addTransaction;
  }
  
  return (
    <Layout>
      <NewsTicker />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">History</h1>
          <p className="text-xl text-gray-300">Track your transactions and earnings</p>
        </div>
        {!isConnected ? (
          <div className="text-center text-gray-400 py-20"><FaHistory className="text-6xl mx-auto mb-4 opacity-50" /><p className="text-xl">Connect your wallet to view your history</p></div>
        ) : loading ? (
          <div className="text-center py-20">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No transactions found. Make a deposit or claim airdrop!</div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="glass-effect p-4 rounded-xl border border-cyan-500/30 text-center"><FaCoins className="text-cyan-400 text-2xl mx-auto mb-2" /><p className="text-gray-400 text-sm">Total Transactions</p><p className="text-2xl font-bold text-white">{transactions.length}</p></div>
              <div className="glass-effect p-4 rounded-xl border border-purple-500/30 text-center"><FaChartLine className="text-purple-400 text-2xl mx-auto mb-2" /><p className="text-gray-400 text-sm">Airdrops</p><p className="text-2xl font-bold text-white">{transactions.filter(t => t.type === 'airdrop').length}</p></div>
              <div className="glass-effect p-4 rounded-xl border border-pink-500/30 text-center"><FaHistory className="text-pink-400 text-2xl mx-auto mb-2" /><p className="text-gray-400 text-sm">Stakes</p><p className="text-2xl font-bold text-white">{transactions.filter(t => t.type === 'stake').length}</p></div>
            </div>
            <TransactionTimeline transactions={transactions} />
          </div>
        )}
      </div>
    </Layout>
  );
}
