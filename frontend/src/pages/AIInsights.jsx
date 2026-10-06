import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, CheckCircle2, ArrowRight, Layers, Tag, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { productsAPI, aiAPI } from '../services/api';

const AIInsights = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  
  // Campaign Generator states
  const [discountPercent, setDiscountPercent] = useState(15);
  const [campaignResult, setCampaignResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchProductsAndRecommendations();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchForecast(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProductsAndRecommendations = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        productsAPI.getAll(),
        aiAPI.getRecommendations()
      ]);
      setProducts(pRes.data);
      setRecommendations(rRes.data);

      if (pRes.data.length > 0) {
        setSelectedProductId(pRes.data[0].id);
      }
    } catch (err) {
      console.error("AI Insights fetch error:", err);
    }
  };

  const fetchForecast = async (productId) => {
    setLoadingForecast(true);
    try {
      const res = await aiAPI.getForecast(productId);
      setForecastData(res.data);
    } catch (err) {
      console.error("Forecast error:", err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const res = await aiAPI.createCampaign({ discount_percent: discountPercent, target_segment: "HIGH_RISK" });
      setCampaignResult(res.data);
      setToastMessage(`Campaign '${res.data.promo_code}' created successfully!`);
      setToastType('success');
    } catch (err) {
      setToastMessage('Error creating campaign');
      setToastType('error');
    }
  };

  const chartPoints = forecastData ? [
    ...forecastData.historical_sales,
    { month: 'Next Month (Forecast)', sales: forecastData.predicted_next_month_demand, isForecast: true }
  ] : [];

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="AI Need & Demand Analysis Engine" />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Scikit-Learn Multi-Model Suite</span>
              <h1 className="text-2xl font-extrabold text-white">Demand Forecast & Customer Retention AI</h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-2 leading-relaxed">
            Compares **Linear Regression** and **Random Forest Regressor** models on historical sales velocity to predict future product demand, compute safety reorder levels, and trigger ML customer churn retention campaigns.
          </p>
        </div>

        {/* Interactive Product Forecast & Multi-Model Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Product for ML Demand Prediction</h3>
              <p className="text-xs text-slate-500">Historical Sales → Ensemble Model Prediction</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                ))}
              </select>
            </div>
          </div>

          {forecastData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Chart Visualizer */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Product: <strong className="text-slate-900">{forecastData.product_name}</strong></span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    Confidence: {(forecastData.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartPoints}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        formatter={(val, name, props) => [
                          `${val} units`, 
                          props.payload.isForecast ? 'Predicted Demand' : 'Historical Sales'
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: '#2563eb' }}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reorder & Model Comparison Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Dynamic ML Recommendation</span>
                  <h4 className="text-lg font-extrabold text-white mt-1">{forecastData.product_name}</h4>

                  {/* Multi Model Comparison */}
                  {forecastData.model_comparison && (
                    <div className="mt-3 p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 text-[11px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Model Accuracy Comparison</span>
                      <div className="flex justify-between text-slate-300">
                        <span>Linear Regression:</span>
                        <strong className="text-blue-300">{forecastData.model_comparison.linear_regression.prediction} units (R²: {forecastData.model_comparison.linear_regression.r2_score})</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Random Forest:</span>
                        <strong className="text-emerald-300">{forecastData.model_comparison.random_forest.prediction} units (R²: {forecastData.model_comparison.random_forest.r2_score})</strong>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Current Stock:</span>
                      <strong className="text-white">{forecastData.current_stock} units</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Ensemble Forecast Demand:</span>
                      <strong className="text-indigo-400 font-bold">{forecastData.predicted_next_month_demand} units</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Recommended Reorder Quantity</span>
                  <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">
                    {forecastData.recommended_reorder_quantity > 0 
                      ? `${forecastData.recommended_reorder_quantity} Units` 
                      : 'Stock Sufficient'}
                  </h3>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Marketing Campaign / Discount Generator */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Automated Customer Retention Campaign Generator</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              ML Churn Targeted
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-3xl">
            Target high churn-risk inactive customers with AI-recommended promotional discount codes to boost store retention.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-300">Discount %:</span>
              <select
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                className="bg-slate-900 text-amber-400 font-bold text-xs py-1 px-2.5 rounded-lg border border-slate-700"
              >
                <option value={10}>10% OFF</option>
                <option value={15}>15% OFF</option>
                <option value={20}>20% OFF</option>
                <option value={25}>25% OFF</option>
              </select>
            </div>

            <button
              onClick={handleCreateCampaign}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Generate Retention Promo Code</span>
            </button>
          </div>

          {campaignResult && (
            <div className="mt-4 p-4 bg-slate-800/90 rounded-xl border border-indigo-500/40 text-xs text-slate-200 flex items-start justify-between">
              <div>
                <p className="font-bold text-emerald-400 text-sm">{campaignResult.message}</p>
                <p className="text-slate-400 mt-1">Target Segment: <strong>{campaignResult.target_segment}</strong> | Estimated Reach: <strong>{campaignResult.estimated_reach}</strong></p>
              </div>
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-lg text-xs font-mono font-bold border border-amber-400/30 shrink-0">
                {campaignResult.promo_code}
              </span>
            </div>
          )}
        </div>

        {/* Database Insights List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Generated Store Insights & Alerts
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{recommendations.length} Active Insights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {rec.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">Live AI Output</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{rec.message}</p>
                {rec.recommended_action && (
                  <p className="text-xs text-blue-700 font-medium bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                    💡 Action: {rec.recommended_action}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AIInsights;
