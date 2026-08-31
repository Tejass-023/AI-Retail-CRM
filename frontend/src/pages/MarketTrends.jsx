import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, MapPin, Layers, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { marketAPI } from '../services/api';

const MarketTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketTrends();
  }, []);

  const fetchMarketTrends = async () => {
    setLoading(true);
    try {
      const res = await marketAPI.getTrends();
      setTrends(res.data);
    } catch (err) {
      console.error("Market trends fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="Privacy-Preserving Market Intelligence" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Hero Privacy Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Aggregated Market Intelligence (Monday MVP Foundation)</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                This module aggregates high-level retail category demand across multiple regions without exposing any individual customer names, contact info, or confidential shop transaction data.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
            🔒 Privacy Protocol Enabled
          </span>
        </div>

        {/* Market Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-slate-400">Loading regional market intelligence...</div>
          ) : (
            trends.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">{t.region}</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{t.demand_change_percent}% Demand
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Category & Top Item</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{t.category}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-1">🔥 Top Trending: {t.top_trending_item}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{t.insight}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default MarketTrends;
