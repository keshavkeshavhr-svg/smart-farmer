import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

const marqueeItems = [
  'Tomato ₹38/kg ↑12%', 'Onion ₹28/kg ↓3%', 'Wheat ₹2,450/q ↑8%',
  'Rice ₹3,100/q ↑5%', 'Cotton ₹7,200/q ↑12%', 'Potato ₹18/kg ↓2%',
  'Soybean ₹4,800/q ↑6%', 'Sugarcane ₹350/q ↑3%',
];

export function MarqueeStrip() {
  const [prices, setPrices] = useState<string[]>(marqueeItems);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const topCrops = ['Tomato', 'Onion', 'Wheat', 'Rice', 'Cotton', 'Potato', 'Soybean', 'Sugarcane'];
        const results = await Promise.all(
          topCrops.map(crop => api.get('/market/summary', { params: { cropName: crop, state: 'Karnataka' } }))
        );
        
        const liveItems = results.map((res: any, index: number) => {
          const arr = Array.isArray(res) ? res : (res.data && Array.isArray(res.data) ? res.data : []);
          const summary = arr[0];
          if (!summary) return marqueeItems[index];

          const { avg7d, avg30d } = summary;
          const trendPercent = avg30d > 0 ? ((avg7d - avg30d) / avg30d * 100).toFixed(1) : '0.0';
          const isUp = parseFloat(trendPercent) >= 0;
          return `${topCrops[index]} ₹${avg7d.toFixed(0)}/kg ${isUp ? '↑' : '↓'}${Math.abs(parseFloat(trendPercent))}%`;
        });
        setPrices(liveItems);
      } catch (err) {
        // keep fallback
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="relative overflow-hidden py-1.5 bg-gray-950/80 backdrop-blur-md border-b border-white/5 z-[60]">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
        {[...prices, ...prices, ...prices].map((item, i) => (
          <span key={i} className="mx-8 text-xs font-mono font-medium text-gray-400 flex items-center gap-2 tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full shadow-md ${item.includes('↑') ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'}`} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
