import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, IndianRupee, ShoppingBag, Sparkles, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { customersAPI } from '../services/api';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await customersAPI.getPurchases(id);
      setData(res.data);
    } catch (err) {
      console.error("Customer details error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50">
        <Navbar title="Customer Profile" />
        <div className="p-8 text-center text-slate-400">Loading customer details...</div>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50">
        <Navbar title="Customer Profile" />
        <div className="p-8 text-center text-slate-400">
          <p>Customer not found.</p>
          <button onClick={() => navigate('/customers')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const { customer, lifetime_value, recommended_cross_sell, purchase_history } = data;

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title={`Customer: ${customer.name}`} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers Directory
          </button>
        </div>

        {/* Top Profile Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {customer.segment.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{customer.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{customer.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Pune, Maharashtra</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Orders</p>
                <p className="text-base font-extrabold text-slate-900">{customer.purchase_count}</p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Spent</p>
                <p className="text-base font-extrabold text-emerald-600">₹{customer.total_spent.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* AI Lifetime Value & Cross-Sell Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">AI Customer Intelligence</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  CLV & Upsell Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Predicted Customer Lifetime Value (CLV)</span>
                  <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">₹{lifetime_value.toLocaleString('en-IN')}</h4>
                  <p className="text-[11px] text-slate-300 mt-1">Estimated annual value based on repeat purchase velocity</p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-300 uppercase font-bold">AI Recommended Next Purchase</span>
                    <p className="text-xs font-semibold text-slate-100 mt-1.5">{recommended_cross_sell}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block">High confidence propensity match</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Customer ID: #{customer.id}</span>
              <span className="text-blue-300 font-semibold">Active Segment: {customer.segment}</span>
            </div>
          </div>

        </div>

        {/* Purchase History Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Complete Purchase History
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{purchase_history.length} Transactions Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Purchased</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                  <th className="py-3 px-4 text-right">Subtotal (₹)</th>
                  <th className="py-3 px-4 text-center">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {purchase_history.length > 0 ? (
                  purchase_history.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.product_name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{tx.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{tx.unit_price}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600">₹{tx.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {tx.payment_method}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No purchase transactions recorded yet for this customer.
                    </td>
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

export default CustomerDetails;
