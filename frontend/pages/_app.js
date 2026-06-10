import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer, useToast } from '../components/Toast';
import { ThemeProvider, useTheme, THEMES } from '../context/ThemeContext';

const liteforge = defineChain({
  id: 4441,
  name: 'LitVM LiteForge',
  nativeCurrency: { decimals: 18, name: 'zkLTC', symbol: 'zkLTC' },
  rpcUrls: { default: { http: ['https://liteforge.rpc.caldera.xyz/http'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://liteforge.explorer.caldera.xyz' } },
});

const config = createConfig({
  chains: [liteforge],
  transports: { [liteforge.id]: http() },
  ssr: true,
});

const queryClient = new QueryClient();

function ThemeBackground() {
  const { currentTheme } = useTheme();
  const theme = THEMES[currentTheme] || THEMES.cyberpunk;
  return (<><div className="fixed inset-0 z-0 pointer-events-none transition-all duration-500" style={{ background: theme.bg }} /><div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-all duration-500" style={{ backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} /></>);
}

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);
  return (<><ThemeBackground />{isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed top-0 left-0 w-full h-1 z-50" style={{ background: 'linear-gradient(90deg, #00f3ff, #b829dd, #ff00ff)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />}<Component {...pageProps} showToast={showToast} /><ToastContainer toasts={toasts} removeToast={removeToast} /><style jsx global>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style></>);
}

export default function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#00f3ff', borderRadius: 'large' })}>
          <ThemeProvider>
            <AppContent Component={Component} pageProps={pageProps} />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
