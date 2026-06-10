import React from 'react';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../context/ThemeContext';

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

export default function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#00f3ff', borderRadius: 'large' })}>
          <ThemeProvider>
            <Component {...pageProps} />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
