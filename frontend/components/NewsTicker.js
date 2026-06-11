import { useState, useEffect } from 'react';

export default function NewsTicker() {
  const [prices, setPrices] = useState({
    lit: { usd: 1.00, usd_24h_change: 0.0 },        // LTUSDC = $1 (mock)
    bitcoin: { usd: 67000, usd_24h_change: 2.5 },
    ethereum: { usd: 3500, usd_24h_change: 1.8 },
    tether: { usd: 1.00, usd_24h_change: 0.01 },
    binancecoin: { usd: 580, usd_24h_change: 3.2 },
    solana: { usd: 145, usd_24h_change: 4.1 },
    cardano: { usd: 0.45, usd_24h_change: -1.2 },
    ripple: { usd: 0.52, usd_24h_change: -1.5 },
    polkadot: { usd: 7.2, usd_24h_change: 2.1 },
    dogecoin: { usd: 0.12, usd_24h_change: 5.0 },
  });

  useEffect(() => {
    let mounted = true;
    const fetchPrices = async () => {
      try {
        const cached = localStorage.getItem('crypto_prices');
        const cachedTime = localStorage.getItem('crypto_prices_time');
        const now = Date.now();
        if (cached && cachedTime && (now - parseInt(cachedTime)) < 5 * 60 * 1000) {
          setPrices(JSON.parse(cached));
          return;
        }
        const ids = 'bitcoin,ethereum,tether,binancecoin,solana,cardano,ripple,polkadot,dogecoin';
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            const newPrices = { lit: { usd: 1.00, usd_24h_change: 0.0 }, ...data };
            setPrices(newPrices);
            localStorage.setItem('crypto_prices', JSON.stringify(newPrices));
            localStorage.setItem('crypto_prices_time', now.toString());
          }
        }
      } catch (error) {
        console.log('Erro ao buscar preços, mantendo fallback');
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const coins = [
    { id: 'lit', name: 'LTUSDC (LIT)', icon: '⚡', isMain: true },
    { id: 'bitcoin', name: 'BTC', icon: '₿' },
    { id: 'ethereum', name: 'ETH', icon: 'Ξ' },
    { id: 'solana', name: 'SOL', icon: '◎' },
    { id: 'binancecoin', name: 'BNB', icon: '◆' },
    { id: 'cardano', name: 'ADA', icon: '⋆' },
    { id: 'ripple', name: 'XRP', icon: '✕' },
    { id: 'polkadot', name: 'DOT', icon: '●' },
    { id: 'dogecoin', name: 'DOGE', icon: 'Ð' },
    { id: 'tether', name: 'USDT', icon: '₮' }
  ];

  // Duplica a lista para efeito de rolagem contínua
  const doubledCoins = [...coins, ...coins];

  return (
    <div className="bg-black/40 backdrop-blur-sm border-b border-cyan-500/20 py-3 overflow-hidden" style={{ minHeight: '80px' }}>
      <div className="flex animate-marquee whitespace-nowrap">
        {doubledCoins.map((coin, idx) => {
          const price = prices[coin.id];
          const change = price?.usd_24h_change || 0;
          const isPositive = change >= 0;
          const isMain = coin.isMain;
          return (
            <div key={idx} className={`flex items-center gap-3 mx-8 ${isMain ? 'bg-yellow-500/20 px-4 py-2 rounded-full' : ''}`}>
              <span className="text-3xl">{coin.icon}</span>
              <span className={`font-bold ${isMain ? 'text-yellow-300' : 'text-white'}`}>{coin.name}</span>
              <span className="text-gray-200 text-lg">
                ${price?.usd?.toLocaleString(undefined, { maximumFractionDigits: price?.usd < 1 ? 4 : 2 }) || '0.00'}
              </span>
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
