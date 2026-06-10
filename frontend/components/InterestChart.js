import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { format, addDays, differenceInDays } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function InterestChart({ principal, depositTimestamp, monthlyRateBps = 500 }) {
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    if (!principal || principal <= 0 || !depositTimestamp) return;
    const now = new Date();
    const depositDate = new Date(depositTimestamp * 1000);
    const daysSinceDeposit = Math.max(1, differenceInDays(now, depositDate));
    const totalDays = 180;
    const labels = []; const principalData = []; const interestData = []; const totalData = [];
    const points = Math.min(totalDays, 30);
    const stepDays = Math.max(1, Math.floor(totalDays / points));
    for (let i = 0; i <= points; i++) {
      const currentDate = addDays(depositDate, i * stepDays);
      if (currentDate > now) break;
      labels.push(format(currentDate, 'dd/MM'));
      const daysElapsed = differenceInDays(currentDate, depositDate);
      if (daysElapsed <= 0) { principalData.push(principal); interestData.push(0); totalData.push(principal); }
      else { const interest = (principal * monthlyRateBps * daysElapsed) / (30 * 10000); principalData.push(principal); interestData.push(interest); totalData.push(principal + interest); }
    }
    setChartData({ labels, datasets: [{ label: 'Total', data: totalData, borderColor: '#00f3ff', backgroundColor: 'rgba(0,243,255,0.1)', borderWidth: 3, fill: true, tension: 0.4 }, { label: 'Principal', data: principalData, borderColor: '#b829dd', borderWidth: 2, borderDash: [5,5], fill: false }, { label: 'Juros', data: interestData, borderColor: '#ff00ff', borderWidth: 2, fill: false }] });
  }, [principal, depositTimestamp, monthlyRateBps]);
  if (!chartData) return <div className="glass-effect rounded-2xl p-8 text-center"><p className="text-gray-400">Faça um depósito para ver o gráfico</p></div>;
  return <div className="glass-effect rounded-2xl p-6 border border-cyan-500/20"><h3 className="text-xl font-bold gradient-text mb-4">📊 Interest Evolution</h3><div className="h-80"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#e5e7eb' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } }} /></div></div>;
}
