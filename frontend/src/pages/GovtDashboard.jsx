import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  ArrowUpRight,
  PackageCheck,
  Wheat,
  Activity,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { govtAPI } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const GovtDashboard = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState({
    total_transfers: 24,
    active_in_transit: 6,
    food_wastage_prevented_kg: 14500,
    wastage_prevention_score: 94.8,
    surplus_regions_count: 4,
    high_demand_regions_count: 5
  });

  const [regionalDemand, setRegionalDemand] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    source_region: 'Nashik Agricultural Belt (Surplus)',
    target_region: 'Pune Metro Region (Deficit)',
    product_name: 'Fresh Food Supplies & Grains',
    quantity_units: 5000
  });

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchGovtData();
  }, []);

  const fetchGovtData = async () => {
    setLoading(true);
    try {
      const [mRes, rdRes, stRes] = await Promise.all([
        govtAPI.getDashboard(),
        govtAPI.getRegionalDemand(),
        govtAPI.getSupplyTransfers()
      ]);
      setMetrics(mRes.data);
      setRegionalDemand(rdRes.data);
      setTransfers(stRes.data);
    } catch (err) {
      console.error("Govt dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await govtAPI.createSupplyTransfer(transferForm);
      setShowModal(false);
      setToastMessage(res.data.message);
      fetchGovtData();
    } catch (err) {
      setToastMessage("Error creating supply transfer");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />

      {/* Top Navbar */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              Government Regional Supply Chain Intelligence
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Govt Analyst Mode
              </span>
            </h1>
            <p className="text-xs text-slate-400">Regional Demand Surge Mapping & Food Wastage Mitigation Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">{user?.full_name || 'Dr. Sunita Deshmukh'}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6 flex-1 w-full">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">National Supply Protection</span>
              <h2 className="text-2xl font-extrabold text-white">Food & Product Wastage Mitigation System</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl mt-2 leading-relaxed">
            Monitors real-time regional demand surges across agricultural and commercial districts. Identifies surplus food stocks and automatically calculates inter-district import & export supply allocations to eliminate food spoilage and shortages.
          </p>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Food Wastage Prevented</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Wheat className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{(metrics.food_wastage_prevented_kg || 14500).toLocaleString()} kg</h3>
            <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">Score: {metrics.wastage_prevention_score}% Efficiency</span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">In-Transit Transfers</span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{metrics.active_in_transit} Transfers</h3>
            <span className="text-[11px] text-blue-300 mt-1 inline-block">Active regional shipments</span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Surplus Stock Regions</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{metrics.surplus_regions_count} Districts</h3>
            <span className="text-[11px] text-amber-300 mt-1 inline-block">High spoilage risk if un-exported</span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">High Demand Deficit Areas</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{metrics.high_demand_regions_count} Regions</h3>
            <span className="text-[11px] text-indigo-300 mt-1 inline-block">Requiring immediate import supply</span>
          </div>
        </div>

        {/* Regional Demand Surge & Wastage Mitigation Cards */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Regional Demand Surges & Surplus Stock Intelligence
              </h3>
              <p className="text-xs text-slate-400">Live district telemetry to prevent food spoilage and supply bottlenecks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalDemand.map((rd, idx) => (
              <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {rd.region}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      rd.demand_surge_percent > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rd.demand_surge_percent > 0 ? `+${rd.demand_surge_percent}% Surge` : `${rd.demand_surge_percent}% Surplus`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold">{rd.top_category}</p>
                  
                  <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                    <p>Status: <strong className="text-white">{rd.stock_status}</strong></p>
                    {rd.surplus_source && <p>Source: <span className="text-emerald-300 font-medium">{rd.surplus_source}</span></p>}
                    {rd.target_export_destination && <p>Target: <span className="text-amber-300 font-medium">{rd.target_export_destination}</span></p>}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTransferForm({
                      source_region: rd.surplus_source || rd.region,
                      target_region: rd.target_export_destination || rd.region,
                      product_name: rd.top_category,
                      quantity_units: rd.recommended_export_qty || 5000
                    });
                    setShowModal(true);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Allocate Supply Transfer</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Import & Export Supply Transfer Manager Table */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Inter-District Import & Export Supply Transfer Log
              </h3>
              <p className="text-xs text-slate-400">Allocated shipments balancing regional demand and preventing wastage</p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Import/Export Allocation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60">
                  <th className="py-3 px-4">Transfer Code</th>
                  <th className="py-3 px-4">Source Region (Surplus)</th>
                  <th className="py-3 px-4">Target Region (Deficit)</th>
                  <th className="py-3 px-4">Product / Food Supplies</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Wastage Prevented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-xs font-medium text-slate-300">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-400 font-mono">{t.transfer_code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{t.source_region}</td>
                    <td className="py-3 px-4 font-semibold text-blue-300">{t.target_region}</td>
                    <td className="py-3 px-4 text-slate-200">{t.product_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{t.quantity_units.toLocaleString()} units</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        t.status === 'DELIVERED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : t.status === 'IN_TRANSIT'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">{t.wastage_prevented_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal: New Supply Allocation */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Inter-District Supply Transfer Allocation"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Source Region (Surplus Stock Area)</label>
            <input
              type="text"
              required
              value={transferForm.source_region}
              onChange={(e) => setTransferForm({ ...transferForm, source_region: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              placeholder="Nashik Agricultural Belt (Surplus)"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Region (High Demand Deficit Area)</label>
            <input
              type="text"
              required
              value={transferForm.target_region}
              onChange={(e) => setTransferForm({ ...transferForm, target_region: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              placeholder="Pune Metro Region (Deficit)"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Product / Food Supplies Name</label>
            <input
              type="text"
              required
              value={transferForm.product_name}
              onChange={(e) => setTransferForm({ ...transferForm, product_name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              placeholder="Fresh Food Grains & Produce"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Allocation Quantity (Units)</label>
            <input
              type="number"
              required
              value={transferForm.quantity_units}
              onChange={(e) => setTransferForm({ ...transferForm, quantity_units: parseInt(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
            >
              Dispatch Supply Allocation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GovtDashboard;
