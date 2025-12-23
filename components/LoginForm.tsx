
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, Building2, ChevronRight, User as UserIcon } from 'lucide-react';
import { DEPARTMENTS } from '../constants';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DEPT_USER');
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'ADMIN' ? 'Dean Office Admin' : `HoD of ${DEPARTMENTS.find(d => d.id === departmentId)?.name}`,
      email,
      role,
      departmentId: role === 'DEPT_USER' ? departmentId : undefined
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-maroon-800 relative overflow-hidden flex-col justify-center p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
            <Building2 size={32} />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Corporate Plan <br/>Progress Tracker</h1>
          <p className="text-xl text-maroon-50 max-w-md">
            Streamlining strategic reporting and accountability for the Faculty of Management Studies and Commerce.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-maroon-400/20 flex items-center justify-center text-maroon-100">
                <ChevronRight size={20} />
              </div>
              <p className="text-sm">Real-time progress monitoring against 7 strategic goals.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-maroon-400/20 flex items-center justify-center text-maroon-100">
                <ChevronRight size={20} />
              </div>
              <p className="text-sm">Department-specific sub-objective tracking and narrative reporting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please enter your credentials to access the faculty tracker.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
              <button 
                type="button"
                onClick={() => setRole('DEPT_USER')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
                  role === 'DEPT_USER' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 size={18} />
                Department
              </button>
              <button 
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
                  role === 'ADMIN' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserIcon size={18} />
                Admin
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon-800 focus:border-transparent transition-all outline-none"
                    placeholder="name@university.ac.lk"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon-800 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {role === 'DEPT_USER' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Department</label>
                  <select 
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon-800 transition-all outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-maroon-800 focus:ring-maroon-800" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm font-semibold text-maroon-800 hover:text-maroon-900">Forgot password?</button>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-lg shadow-maroon-100 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <footer className="mt-12 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Faculty of Management Studies and Commerce. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
