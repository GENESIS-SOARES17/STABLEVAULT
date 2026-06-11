import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaHistory, FaUsers, FaCoins, FaTrophy, FaGlobe, FaTelegram, FaTwitter, FaBook } from 'react-icons/fa';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme, THEMES } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';

export default function Layout({ children }) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const theme = THEMES[currentTheme] || THEMES.orkut;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/pool', label: 'Pool', icon: FaChartLine },
    { href: '/staking', label: 'Staking', icon: FaCoins },
    { href: '/leaderboard', label: 'Ranking', icon: FaTrophy },
    { href: '/referrals', label: 'Referrals', icon: FaUsers },
    { href: '/history', label: 'History', icon: FaHistory },
  ];

  const externalLinks = [
    { href: 'https://guestbook-litvm-newcode.vercel.app/', icon: FaBook, label: 'Guestbook' },
    { href: 'https://testnet.litvm.com/', icon: FaGlobe, label: 'Testnet' },
    { href: 'https://t.me/litecoinvm', icon: FaTelegram, label: 'Telegram' },
    { href: 'https://x.com/LitecoinVM', icon: FaTwitter, label: 'Twitter' },
  ];

  if (!mounted) return <div className="min-h-screen" />;

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
            {/* Lado esquerdo: ícone + título */}
            <Link href="/" className="group flex items-center gap-2 shrink-0">
              <Image 
                src="/assets/images/icone2.png" 
                alt="Logo" 
                width={96} 
                height={96} 
                className="rounded-lg transition-transform group-hover:scale-105"
                priority
              />
              <span className="hidden sm:inline" style={{ fontFamily: "Orbitron, sans-serif", color: "#FFD700", textShadow: "2px 2px 0 #B8860B, 4px 4px 0 #8B4513", fontSize: "3rem", display: "inline-block", transform: "scaleX(2)", marginLeft: "0.5rem", marginRight: "1rem" }}>
                LIT-StableVault
              </span>
            </Link>

            {/* Lado direito: navegação + links externos + botão */}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Links de navegação (Home, Pool, etc.) */}
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

              {/* Separador visual (opcional) */}
              <div className="hidden md:block h-8 w-px bg-gray-500/30 mx-1" />

              {/* Links externos (Guestbook, Testnet, Telegram, Twitter) */}
              {externalLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10"
                    style={{ color: theme.text }}
                    title={link.label}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium" style={{ fontFamily: 'Orbitron, sans-serif' }}>{link.label}</span>
                  </motion.a>
                );
              })}

              {/* Botão de conexão da carteira */}
              <ConnectButton showBalance={false} />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="pb-20 md:pb-0 relative z-10">{children}</main>
      <ThemeSelector />
      <footer className="border-t py-8 mt-16 relative z-10 transition-all duration-500" style={{ background: theme.card, backdropFilter: 'blur(10px)', borderColor: theme.border, color: theme.text }}>
        <div className="container mx-auto px-4 text-center opacity-70">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Image src="/assets/images/icone2.png" alt="Logo" width={32} height={32} className="rounded" />
            <span className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>LIT-StableVault</span>
          </div>
          <p className="text-sm mb-2">Interest Pool - {theme.name} Theme</p>
          <p className="text-xs opacity-50">Network: LitVM LiteForge Testnet (Chain ID: 4441)</p>
        </div>
      </footer>
    </div>
  );
}
