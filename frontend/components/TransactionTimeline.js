import { motion } from 'framer-motion';
import { FaGift, FaArrowDown, FaArrowUp, FaHandHoldingUsd, FaCoins, FaLock, FaUnlockAlt } from 'react-icons/fa';

export default function TransactionTimeline({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">No transactions found.</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'airdrop': return <FaGift className="text-purple-400" />;
      case 'deposit': return <FaArrowDown className="text-cyan-400" />;
      case 'withdraw': return <FaArrowUp className="text-pink-400" />;
      case 'partialWithdraw': return <FaHandHoldingUsd className="text-yellow-400" />;
      case 'mint': return <FaCoins className="text-green-400" />;
      case 'stake': return <FaLock className="text-blue-400" />;
      case 'unstake': return <FaUnlockAlt className="text-orange-400" />;
      case 'partialUnstake': return <FaHandHoldingUsd className="text-orange-400" />;
      default: return <FaCoins className="text-gray-400" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'airdrop': return 'border-purple-500 bg-purple-500/10 shadow-purple-500/50';
      case 'deposit': return 'border-cyan-500 bg-cyan-500/10 shadow-cyan-500/50';
      case 'withdraw': return 'border-pink-500 bg-pink-500/10 shadow-pink-500/50';
      case 'partialWithdraw': return 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/50';
      case 'mint': return 'border-green-500 bg-green-500/10 shadow-green-500/50';
      case 'stake': return 'border-blue-500 bg-blue-500/10 shadow-blue-500/50';
      case 'unstake': return 'border-orange-500 bg-orange-500/10 shadow-orange-500/50';
      case 'partialUnstake': return 'border-orange-500 bg-orange-500/10 shadow-orange-500/50';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getLabel = (type) => {
    const labels = {
      airdrop: 'Airdrop Received',
      deposit: 'Deposit',
      withdraw: 'Withdrawal',
      partialWithdraw: 'Partial Withdrawal',
      mint: 'Mint LTUSDC',
      stake: 'Stake Created',
      unstake: 'Stake Withdrawn',
      partialUnstake: 'Partial Unstake'
    };
    return labels[type] || type;
  };

  return (
    <div className="relative pl-8 md:pl-0">
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 transform md:-translate-x-1/2 opacity-50" />
      <div className="space-y-8">
        {transactions.map((tx, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`relative flex items-center md:justify-between ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
            >
              <div className={`w-full md:w-5/12 ${isLeft ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                <div className="glass-effect p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all group">
                  <div className={`flex items-center gap-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-lg border-2 ${getColor(tx.type)} shadow-lg`}>
                      {getIcon(tx.type)}
                    </div>
                    <div className={isLeft ? 'md:text-right' : ''}>
                      <h4 className="font-bold text-white capitalize">{getLabel(tx.type)}</h4>
                      <p className="text-xs text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t border-gray-800 flex justify-between items-center ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                    <span className="text-lg font-bold text-cyan-400">{tx.amount} LTUSDC</span>
                    <a href={`https://liteforge.explorer.caldera.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 font-mono hover:text-cyan-400">
                      {tx.hash.substring(0,6)}...{tx.hash.substring(tx.hash.length-4)}
                    </a>
                  </div>
                </div>
              </div>
              <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_10px_#00f3ff] transform -translate-x-1/2 z-10" />
              <div className="hidden md:block w-5/12" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
