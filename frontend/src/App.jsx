import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AIChatbot from './components/AIChatbot';
import IntroVideoModal from './components/IntroVideoModal';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GovtDashboard from './pages/GovtDashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import MarketTrends from './pages/MarketTrends';

const ProtectedLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 relative">
      <IntroVideoModal />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
      <AIChatbot />
    </div>
  );
};

const GovtProtectedLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <IntroVideoModal />
      {children}
      <AIChatbot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Government Analyst Dashboard Route */}
          <Route path="/govt-dashboard" element={<GovtProtectedLayout><GovtDashboard /></GovtProtectedLayout>} />

          {/* Shop Owner Protected Main Pages */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />
          <Route path="/customers/:id" element={<ProtectedLayout><CustomerDetails /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/ai-insights" element={<ProtectedLayout><AIInsights /></ProtectedLayout>} />
          <Route path="/market-trends" element={<ProtectedLayout><MarketTrends /></ProtectedLayout>} />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
