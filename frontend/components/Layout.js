import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaChartLine, FaHistory, FaUsers, FaCoins, FaTrophy, FaGlobe, FaTelegram, FaTwitter, FaBook } from 'react-icons/fa';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme, THEMES } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';

export default function Layout({ children }) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const theme = THEMES[currentTheme] || THEMES.cyberpunk;

  const navItems = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/pool', label: 'Pool', icon: FaChartLine },
    { href: '/staking', label: 'Staking', icon: FaCoins },
    { href: '/leaderboard', label: 'Ranking', icon: FaTrophy },
    { href: '/referrals', label: 'Referrals', icon: FaUsers },
    { href: '/history', label: 'History', icon: FaHistory },
  ];

  const externalLinks = [
    { href: 'https://guestbook-litvm-newcode.vercel.app/', icon: FaBook, label: 'Guestbook', color: 'hover:text-purple-400' },
    { href: 'https://testnet.litvm.com/', icon: FaGlobe, label: 'Testnet', color: 'hover:text-cyan-400' },
    { href: 'https://t.me/litecoinvm', icon: FaTelegram, label: 'Telegram', color: 'hover:text-blue-400' },
    { href: 'https://x.com/LitecoinVM', icon: FaTwitter, label: 'Twitter', color: 'hover:text-sky-400' },
  ];

  return (
    <div className="min-h-screen relative">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 border-b transition-all duration-500"
        style={{ background: theme.card, backdropFilter: 'blur(10px)', borderColor: theme.border }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 group-hover:shadow-lg transition-all" style={{ borderColor: theme.accent }}>
                  <Image src="/assets/images/icone.png" alt="LIT-StableVault" fill className="object-cover" priority />
                </motion.div>
              </Link>
              <div className="hidden md:flex items-center space-x-3">
                {externalLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.a key={index} href={link.href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10" style={{ color: theme.text }} title={link.label}>
                      <Icon size={20} />
                      <span className="text-sm font-medium" style={{ fontFamily: 'Orbitron, sans-serif' }}>{link.label}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
            <nav className="flex items-center gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer" style={{ background: isActive ? `${theme.accent}20` : 'transparent', color: isActive ? theme.accent : theme.text, border: isActive ? `1px solid ${theme.accent}50` : '1px solid transparent' }}>
                      <Icon size={18} />
                      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', letterSpacing: '1px' }}>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
              <ConnectButton showBalance={false} />
            </nav>
          </div>
        </div>
      </motion.header>
      <main className="pb-20 md:pb-0 relative z-10">{children}</main>
      <ThemeSelector />
      <footer className="border-t py-8 mt-16 relative z-10 transition-all duration-500" style={{ background: theme.card, backdropFilter: 'blur(10px)', borderColor: theme.border, color: theme.text }}>
        <div className="container mx-auto px-4 text-center opacity-70">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 relative"><Image src="/assets/images/icone.png" alt="Icon" fill className="object-contain" /></div>
            <p className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>LIT-StableVault</p>
          </div>
          <p className="text-sm mb-2">Interest Pool - {theme.name} Theme</p>
          <p className="text-xs opacity-50">Network: LitVM LiteForge Testnet (Chain ID: 4441)</p>
        </div>
      </footer>
    </div>
  );
}
