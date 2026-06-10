import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" href="/favicon-512x512.png" />
        <meta name="theme-color" content="#00f3ff" />
        <meta name="description" content="LIT-StableVault - Interest Pool with Automatic Airdrop on LitVM LiteForge. Earn 5% monthly interest on your deposits." />
        <meta property="og:title" content="LIT-StableVault - Interest Pool" />
        <meta property="og:description" content="Earn 5% monthly interest on your LTUSDC deposits. Automatic airdrop of 1000 LTUSDC for new users!" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
