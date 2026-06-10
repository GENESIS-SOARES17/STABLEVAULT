import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side only: wait for mounted before rendering theme-dependent UI
  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  // ... (rest of the Layout component remains the same)
  // (copy the rest of your Layout component from your existing file)
  // For brevity, I'm assuming the rest of the component is unchanged.
  // You'll need to paste the rest of your Layout component here.
}
