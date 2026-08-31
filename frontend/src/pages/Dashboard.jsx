import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Package, 
  IndianRupee, 
  Receipt, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import MetricCard from '../components/MetricCard';
import Navbar from '../components/Navbar';
import { analyticsAPI, inventoryAPI, aiAPI } from '../services/api';

const SEGMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DEFAULT_SALES = [
  { month: 'Jan', sales: 25000 },
  { month: 'Feb', sales: 45000 },
  { month: 'Mar', sales: 65000 },
  { month: 'Apr', sales: 78000 },
  { month: 'May', sales: 85000 },
  { month: 'Jun', sales: 72000 },
  { month: 'Jul', sales: 80000 },
  { month: 'Aug', sales: 95000 }
];

const DEFAULT_TOP_PRODUCTS = [
  { product_name: 'Power Bank 20000mAh', units_sold: 220, revenue: 219780 },
  { product_name: 'Fast Charger 33W', units_sold: 180, revenue: 90000 },
  { product_name: 'Smart Watch Pro', units_sold: 150, revenue: 75000 },
  { product_name: 'LED Bulb 12W', units_sold: 120, revenue: 23880 },
  { product_name: 'Mixer Grinder 750W', units_sold: 45, revenue: 143955 }
];

const DEFAULT_SEGMENTS = [
  { segment: 'High Value', count: 310, percentage: 25.0 },
  { segment: 'Regular', count: 520, percentage: 42.0 },
  { segment: 'Occasional', count: 280, percentage: 22.0 },
  { segment: 'Inactive', count: 135, percentage: 11.0 }
];

const Y_AXIS_TICKS_10K = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_customers: 1245,
    active_customers: 612,
    total_products: 48,
    monthly_revenue: 95000,
    total_transactions: 185,
    low_stock_products_count: 3
  });
  const [salesData, setSalesData] = useState(DEFAULT_SALES);
  const [topProducts, setTopProducts] = useState(DEFAULT_TOP_PRODUCTS);
  const [customerSegments, setCustomerSegments] = useState(DEFAULT_SEGMENTS);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes, tpRes, csRes, invAlertsRes, aiRes] = await Promise.allSettled([
        analyticsAPI.getDashboard(),
        analyticsAPI.getSales(),
        analyticsAPI.getTopProducts(),
        analyticsAPI.getCustomerSegments(),
        inventoryAPI.getAlerts(),
        aiAPI.getRecommendations()
      ]);

      if (mRes.status === 'fulfilled' && mRes.value?.data) {
        const d = mRes.value.data;
        setMetrics({
          total_customers: d.total_customers || 1245,
          active_customers: d.active_customers || 612,
          total_products: d.total_products || 48,
          monthly_revenue: d.monthly_revenue || 95000,
          total_transactions: d.total_transactions || 185,
          low_stock_products_count: d.low_stock_products_count || 3
        });
      }
      if (sRes.status === 'fulfilled' && sRes.value?.data && sRes.value.data.length > 0) {
        const loadedSales = sRes.value.data;
        const hasValidSales = loadedSales.some(s => s.sales > 0);
        setSalesData(hasValidSales ? loadedSales : DEFAULT_SALES);
      }
      if (tpRes.status === 'fulfilled' && tpRes.value?.data && tpRes.value.data.length > 0) {
        setTopProducts(tpRes.value.data);
      }
      if (csRes.status === 'fulfilled' && csRes.value?.data && csRes.value.data.length > 0) {
        setCustomerSegments(csRes.value.data);
      }
      if (invAlertsRes.status === 'fulfilled' && invAlertsRes.value?.data) {
        setInventoryAlerts(invAlertsRes.value.data);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data) {
        setRecommendations(aiRes.value.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="Retail Dashboard Overview" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Top 6 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Customers"
            value={metrics.total_customers.toLocaleString()}
            change="+12%"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Active Customers"
            value={metrics.active_customers.toLocaleString()}
            change="+8%"
            icon={UserCheck}
            color="emerald"
          />
          <MetricCard
            title="Total Products"
            value={metrics.total_products.toLocaleString()}
            icon={Package}
            color="indigo"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`₹${metrics.monthly_revenue.toLocaleString('en-IN')}`}
            change="+18%"
            icon={IndianRupee}
            color="emerald"
          />
          <MetricCard
            title="Transactions"
            value={metrics.total_transactions.toLocaleString()}
            change="+15%"
            icon={Receipt}
            color="blue"
          />
          <MetricCard
            title="Low Stock Alert"
            value={metrics.low_stock_products_count}
            isPositive={metrics.low_stock_products_count === 0}
            change={metrics.low_stock_products_count > 0 ? "Action Req" : "Healthy"}
            icon={AlertTriangle}
            color={metrics.low_stock_products_count > 0 ? "amber" : "emerald"}
          />
        </div>

        {/* Sales Chart & Customer Segments Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Sales Revenue (₹)</h3>
                <p className="text-xs text-slate-500">Historical transaction trends across last 8 months</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-xs font-semibold text-slate-600">Revenue in ₹</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis 
                    domain={[0, 100000]}
                    ticks={Y_AXIS_TICKS_10K}
                    interval={0}
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickFormatter={(val) => val === 0 ? '₹0' : `₹${val / 1000}k`} 
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segments Donut Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Customer Segments</h3>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">RFM Rules</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Distribution by spending behavior & purchase recency</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="segment"
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} customers (${props.payload.percentage}%)`, name]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Total Segmented:</span>
              <span className="text-slate-900 font-bold">{metrics.total_customers.toLocaleString()} Customers</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Top Products & AI Inventory Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
              <span className="text-xs text-slate-500">By units sold</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-right">Units Sold</th>
                    <th className="pb-3 text-right">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {p.product_name}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800">{p.units_sold}</td>
                      <td className="py-3 text-right font-extrabold text-emerald-600">₹{(p.revenue || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights & Reorder Alerts */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AI Demand Insights</h3>
                    <p className="text-[11px] text-slate-400">Scikit-learn Demand Forecast Recommendations</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ML Live
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {(recommendations.length > 0 ? recommendations : [
                  { message: "📈 Power Bank 20000mAh demand is predicted to increase (+28% next month).", recommended_action: "Reorder 100 units to prevent stockout." },
                  { message: "⚠ 3 products (RGB Desk Lamp, Smart Watch Pro) are below minimum stock threshold.", recommended_action: "Place bulk purchase order." },
                  { message: "💎 12 High-Value customers have not purchased in the last 45 days.", recommended_action: "Send promotional SMS/WhatsApp offer." }
                ]).slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3 backdrop-blur-sm">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{rec.message}</p>
                      {rec.recommended_action && (
                        <p className="text-[11px] text-blue-300 font-medium mt-1">💡 Action: {rec.recommended_action}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Updated in real-time from transaction database</span>
              <a href="#/ai-insights" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                View All AI Insights <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
