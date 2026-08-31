import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Navbar from '../components/Navbar';
import { productsAPI, aiAPI } from '../services/api';

const AIInsights = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

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

  // Combine historical and predicted forecast point for chart visualizer
  const chartPoints = forecastData ? [
    ...forecastData.historical_sales,
    { month: 'Sept (Forecast)', sales: forecastData.predicted_next_month_demand, isForecast: true }
  ] : [];

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="AI Need & Demand Analysis Engine" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Machine Learning Core</span>
              <h1 className="text-2xl font-extrabold text-white">Scikit-learn Linear Regression Demand Forecast</h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-2 leading-relaxed">
            The AI engine analyzes month-over-month sales velocity for each product, fits an explainable linear regression model, and dynamically computes exact inventory reorder recommendations to avoid stockouts.
          </p>
        </div>

        {/* Interactive Product Forecast Visualizer */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Product to Run Demand Model</h3>
              <p className="text-xs text-slate-500">Historical Sales → ML Next Month Prediction</p>
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
                    ML Model Confidence: {(forecastData.confidence_score * 100).toFixed(0)}%
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
                          props.payload.isForecast ? 'Predicted Demand (Sept)' : 'Historical Sales'
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

              {/* Reorder Recommendation Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Dynamic Recommendation</span>
                  <h4 className="text-lg font-extrabold text-white mt-1">{forecastData.product_name}</h4>

                  <div className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span>Current Stock:</span>
                      <strong className="text-white">{forecastData.current_stock} units</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span>Predicted Demand (Next Month):</span>
                      <strong className="text-indigo-400 font-bold">{forecastData.predicted_next_month_demand} units</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span>Safety Threshold Stock:</span>
                      <strong className="text-white">10 units</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Recommended Reorder Quantity</span>
                  <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                    {forecastData.recommended_reorder_quantity > 0 
                      ? `${forecastData.recommended_reorder_quantity} Units` 
                      : 'Stock Sufficient'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Calculated dynamically to maintain safety stock level</p>
                </div>
              </div>

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
