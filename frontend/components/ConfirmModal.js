import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning', loading = false }) {
  if (!isOpen) return null;
  const getIcon = () => { if (type === 'success') return <FaCheckCircle className="text-green-400" />; if (type === 'info') return <FaCheckCircle className="text-cyan-400" />; return <FaExclamationTriangle className="text-yellow-400" />; };
  const getBorderColor = () => { if (type === 'success') return 'border-green-500/50 shadow-green-500/30'; if (type === 'info') return 'border-cyan-500/50 shadow-cyan-500/30'; return 'border-yellow-500/50 shadow-yellow-500/30'; };
  return (
    <AnimatePresence>
      {isOpen && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`glass-effect rounded-2xl p-6 max-w-md w-full border-2 ${getBorderColor()} shadow-2xl pointer-events-auto`}>
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="text-3xl">{getIcon()}</div><h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>{title}</h3></div><button onClick={onClose} disabled={loading} className="p-2 rounded-lg hover:bg-gray-800/50 transition-all disabled:opacity-50"><FaTimes className="text-gray-400" /></button></div>
          <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3"><button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-all disabled:opacity-50 font-semibold">{cancelText}</button><button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all disabled:opacity-50 ${(type === 'success' || type === 'info') ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105' : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:scale-105'}`}>{loading ? 'Processing...' : confirmText}</button></div>
        </div>
      </motion.div></>)}
    </AnimatePresence>
  );
}
