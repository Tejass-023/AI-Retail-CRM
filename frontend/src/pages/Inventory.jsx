import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import { inventoryAPI } from '../services/api';

const STATUS_CONFIG = {
  IN_STOCK: { label: 'Healthy', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  LOW_STOCK: { label: 'Low Stock', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
  OUT_OF_STOCK: { label: 'Out of Stock', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getAll({ status_filter: statusFilter });
      setInventory(res.data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="Inventory & Demand Planning" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inventory Status & Reorder Formula</h1>
            <p className="text-xs text-slate-500">
              Formula: Reorder Quantity = max(0, Predicted Demand + Safety Stock - Current Stock)
            </p>
          </div>
          <button
            onClick={fetchInventory}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh Demand Calculations</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 card-shadow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Stock Status Filter:</span>
          </div>
          <div className="flex items-center gap-2">
            {['ALL', 'LOW_STOCK', 'OUT_OF_STOCK', 'IN_STOCK'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Products' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Product & Category</th>
                  <th className="py-3.5 px-4 text-right">Current Stock</th>
                  <th className="py-3.5 px-4 text-right">Min Threshold</th>
                  <th className="py-3.5 px-4 text-right">ML Predicted Demand</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Recommended Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Calculating inventory forecasts...</td>
                  </tr>
                ) : inventory.length > 0 ? (
                  inventory.map((inv) => {
                    const statusObj = STATUS_CONFIG[inv.status] || STATUS_CONFIG.IN_STOCK;
                    const StatusIcon = statusObj.icon;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          <p className="text-sm font-bold text-slate-900">{inv.product_name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{inv.category_name}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                          {inv.current_stock} units
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{inv.min_stock} units</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-indigo-600 text-sm">
                          {inv.predicted_demand} units
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase ${statusObj.badge}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusObj.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {inv.recommended_reorder > 0 ? (
                            <span className="inline-flex px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20">
                              Reorder {inv.recommended_reorder} units
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold text-xs">Stock Sufficient</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">No inventory records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Inventory;
