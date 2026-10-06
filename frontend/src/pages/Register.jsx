import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building2, User, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/VideoBackground';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState('SHOP_OWNER'); // SHOP_OWNER or GOVERNMENT_ANALYST
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const sName = selectedRole === 'SHOP_OWNER' ? (shopName || 'My Retail Shop') : 'Government Intelligence Division';
    const res = await register(name, email, password, sName, selectedRole);
    setLoading(false);

    if (res.success) {
      if (selectedRole === 'GOVERNMENT_ANALYST') {
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            {selectedRole === 'SHOP_OWNER' ? <Store className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join the AI-Powered Retail & Supply Intelligence Platform</p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setSelectedRole('SHOP_OWNER')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
            onClick={() => setSelectedRole('GOVERNMENT_ANALYST')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder={selectedRole === 'SHOP_OWNER' ? "Rajesh Sharma" : "Dr. Sunita Deshmukh"}
              />
            </div>
          </div>

          {selectedRole === 'SHOP_OWNER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shop / Store Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Apna Retail Mart"
                />
              </div>
            </div>
          )}

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
                placeholder={selectedRole === 'SHOP_OWNER' ? "rajesh@apnamart.com" : "sunita@gov.in"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'SHOP_OWNER'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Register as {selectedRole === 'SHOP_OWNER' ? 'Shop Owner' : 'Govt Analyst'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
