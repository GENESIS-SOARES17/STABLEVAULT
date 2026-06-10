import Link from 'next/link';
export default function Custom404() { return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-6xl font-bold">404</h1><p className="mt-4">Page not found</p><Link href="/" className="mt-6 inline-block px-6 py-3 bg-cyan-500 rounded-lg">Go Home</Link></div></div>); }
