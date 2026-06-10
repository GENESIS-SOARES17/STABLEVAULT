import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setIsVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  const getIcon = () => { switch(type) { case 'success': return <FaCheckCircle className="text-green-400" />; case 'error': return <FaExclamationCircle className="text-red-400" />; case 'warning': return <FaExclamationCircle className="text-yellow-400" />; default: return <FaInfoCircle className="text-cyan-400" />; } };
  const getBorderColor = () => { switch(type) { case 'success': return 'border-green-500/50'; case 'error': return 'border-red-500/50'; case 'warning': return 'border-yellow-500/50'; default: return 'border-cyan-500/50'; } };
  if (!isVisible) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.8 }} className={`fixed top-24 right-4 z-50 glass-effect rounded-xl p-4 border-2 ${getBorderColor()} shadow-2xl max-w-sm`}>
      <div className="flex items-start gap-3"><div className="text-2xl flex-shrink-0">{getIcon()}</div><div className="flex-1"><p className="text-white text-sm leading-relaxed">{message}</p></div><button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="text-gray-400 hover:text-white transition-all flex-shrink-0"><FaTimes /></button></div>
      <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: duration / 1000, ease: "linear" }} className={`h-1 mt-3 rounded-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-cyan-500'}`} />
    </motion.div>
  );
}

export function useToast() { const [toasts, setToasts] = useState([]); const showToast = (message, type = 'info', duration = 5000) => { const id = Date.now(); setToasts(prev => [...prev, { id, message, type, duration }]); }; const removeToast = (id) => { setToasts(prev => prev.filter(t => t.id !== id)); }; return { toasts, showToast, removeToast }; }

export function ToastContainer({ toasts, removeToast }) { return (<div className="fixed top-24 right-4 z-50 space-y-3"><AnimatePresence>{toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />)}</AnimatePresence></div>); }
