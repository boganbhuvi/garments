import React, { useState } from 'react';
import { api } from '../services/api';
import { Scissors, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export interface StaffUser {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  branchIds: string[];
}

interface StaffLoginPageProps {
  onLoginSuccess: (user: StaffUser) => void;
  onBackToPublic: () => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await api.loginStaff(username.trim(), password);
    setLoading(false);

    if (!res.ok || !res.user) {
      setError(res.error || 'Invalid credentials.');
      return;
    }
    onLoginSuccess(res.user);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-7 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#7F1D1D] text-white flex items-center justify-center shadow">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Giriraj City Garments</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enterprise ERP · Staff Sign In
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter staff username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In to ERP'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={onBackToPublic}
            className="inline-flex items-center gap-1 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </button>
          <span>Role-Based Access</span>
        </div>
      </div>
    </div>
  );
};
