
import React, { useState } from 'react';
import { User } from '../types';
import { DEPARTMENTS } from '../constants';
import { UserCircle, Shield, Bell, Key, Mail, Building2, Save, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

const UserSettings: React.FC<Props> = ({ user, onLogout }) => {
  const [showSaved, setShowSaved] = useState(false);
  const deptName = DEPARTMENTS.find(d => d.id === user.departmentId)?.name || 'Dean Office';

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Settings</h2>
          <p className="text-slate-500">Manage your profile, account security and notification preferences.</p>
        </div>
        {showSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 size={16} />
            Changes saved successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          <SettingsNavLink icon={<UserCircle size={18} />} label="Account Profile" active={true} />
          <SettingsNavLink icon={<Bell size={18} />} label="Notifications" active={false} />
          <SettingsNavLink icon={<Shield size={18} />} label="Privacy & Security" active={false} />
          <SettingsNavLink icon={<Key size={18} />} label="Password" active={false} />
          
          <div className="mt-8 p-4 bg-maroon-50 rounded-2xl border border-maroon-100">
            <div className="flex items-center gap-2 text-maroon-800 font-bold mb-2">
              <Info size={16} />
              <p className="text-xs uppercase tracking-wider">Access Level</p>
            </div>
            <p className="text-xs text-maroon-700 leading-relaxed font-medium">
              You are currently logged in with <span className="underline">{user.role}</span> privileges for the 2024/2025 Corporate Plan cycle.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserCircle size={20} className="text-maroon-800" />
                Profile Information
              </h3>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-maroon-800 text-white text-xs font-bold rounded-xl hover:bg-maroon-900 transition-all">
                <Save size={14} />
                Save Changes
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      defaultValue={user.name}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon-800 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Department / Unit</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    defaultValue={deptName}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bell size={20} className="text-maroon-800" />
                Notification Preferences
              </h3>
            </div>
            <div className="p-8 space-y-4">
              <NotificationToggle label="Deadline Reminders" description="Receive email alerts when reporting periods are closing." checked={true} />
              <NotificationToggle label="Revision Requests" description="Instant notification if the Dean's office requests a revision." checked={true} />
              <NotificationToggle label="Monthly Summaries" description="Receive a PDF summary of your department's submission." checked={false} />
            </div>
          </section>

          {/* Security Summary Section */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield size={20} className="text-maroon-800" />
                Account Security
              </h3>
              <button className="text-maroon-800 text-xs font-bold hover:underline">Change Password</button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Managed by University Central IT</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2 py-1 bg-emerald-50 rounded">Active</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingsNavLink: React.FC<{ icon: React.ReactNode; label: string; active: boolean }> = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
    active ? 'bg-white text-maroon-800 shadow-sm border border-slate-200 translate-x-1' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
  }`}>
    {icon}
    {label}
  </button>
);

const NotificationToggle: React.FC<{ label: string; description: string; checked: boolean }> = ({ label, description, checked }) => (
  <div className="flex items-center justify-between group">
    <div>
      <p className="text-sm font-bold text-slate-800 group-hover:text-maroon-800 transition-colors">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${checked ? 'bg-maroon-800' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
    </div>
  </div>
);

export default UserSettings;
