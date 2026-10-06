import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building2, Eye, EyeOff, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/VideoBackground';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('SHOP_OWNER'); // SHOP_OWNER or GOVERNMENT_ANALYST
  const [email, setEmail] = useState('owner@apnacrm.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'SHOP_OWNER') {
      setEmail('owner@apnacrm.com');
      setPassword('password123');
    } else {
      setEmail('analyst@gov.in');
      setPassword('govpass123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'GOVERNMENT_ANALYST' || selectedRole === 'GOVERNMENT_ANALYST') {
        navigate('/govt-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* High-Tech Ambient Video Background */}
      <VideoBackground />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 z-10 relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            {selectedRole === 'SHOP_OWNER' ? <Store className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">AI CRM & Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">Select your account role to sign in</p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('SHOP_OWNER')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'SHOP_OWNER'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shop Owner</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleRoleSelect('GOVERNMENT_ANALYST')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'GOVERNMENT_ANALYST'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Govt Analyst</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder={selectedRole === 'SHOP_OWNER' ? "owner@apnacrm.com" : "analyst@gov.in"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
              selectedRole === 'SHOP_OWNER'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In as {selectedRole === 'SHOP_OWNER' ? 'Shop Owner' : 'Govt Analyst'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Links for Both Roles */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
          <span>New User?</span>
          <Link to="/register" className="font-bold text-blue-600 hover:underline flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New {selectedRole === 'SHOP_OWNER' ? 'Shop' : 'Analyst'} Account</span>
          </Link>
        </div>

        {/* Demo Quick Login Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">1-Click Demo Quick Login</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleRoleSelect('SHOP_OWNER');
              }}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg transition-colors border border-blue-200 text-center"
            >
              Demo Shop Owner
            </button>
            <button
              onClick={() => {
                handleRoleSelect('GOVERNMENT_ANALYST');
              }}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors border border-emerald-200 text-center"
            >
              Demo Govt Analyst
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
