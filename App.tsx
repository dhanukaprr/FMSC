
import React, { useState, useEffect, useCallback } from 'react';
import { User, Report, Department, UserRole } from './types';
import { DEPARTMENTS } from './constants';
// Added FileCheck to the imports to resolve 'Cannot find name FileCheck' error
import { LogIn, LayoutDashboard, FileText, FileCheck, Settings, LogOut, Building2, UserCircle, Menu, X, RefreshCw, CloudCheck, AlertTriangle, CloudOff } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import DeptReportWorkflow from './components/DeptReportWorkflow';
import LoginForm from './components/LoginForm';
import PastReports from './components/PastReports';
import UserSettings from './components/UserSettings';

// Netlify Function Path
const API_BASE = '/.netlify/functions/api';
const LOCAL_STORAGE_KEY = 'fmsc_reports_data';

type TabType = 'dashboard' | 'reports' | 'settings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Load Initial Data
  useEffect(() => {
    // 1. Load User
    const savedUser = localStorage.getItem('fmsc_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    // 2. Load Reports (Local first for immediate UI responsiveness)
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      setReports(JSON.parse(localData));
    }

    // 3. Sync from Cloud
    const fetchReports = async () => {
      try {
        const res = await fetch(API_BASE);
        if (res.ok) {
          const cloudData = await res.json();
          if (Array.isArray(cloudData)) {
            // Merge or replace based on data presence
            if (cloudData.length > 0) {
              setReports(cloudData);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
            }
            setIsOffline(false);
          }
        } else {
          console.warn(`API responded with ${res.status}. Running in Local Mode.`);
          setIsOffline(true);
        }
      } catch (err) {
        console.warn("Cloud sync connection failed. Running in Local Mode.", err);
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fmsc_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fmsc_user');
    setActiveTab('dashboard');
  };

  const updateReports = useCallback(async (updatedReports: Report[]) => {
    // Immediate Update
    setReports(updatedReports);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedReports));

    // Determine which report changed
    const modifiedReport = updatedReports.find((updated) => {
      const original = reports.find(r => r.id === updated.id);
      return !original || JSON.stringify(original) !== JSON.stringify(updated);
    });

    // Background Sync
    if (modifiedReport && !isOffline) {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modifiedReport)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Sync failed");
        }
        setIsOffline(false);
      } catch (err: any) {
        console.error("Cloud save failed:", err);
        setSyncError("Cloud save failed. Changes kept locally.");
        // Don't set isOffline=true here so it retries on next change
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    }
  }, [reports, isOffline]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-800"></div>
          <p className="text-slate-500 font-medium animate-pulse text-sm">Initializing Tracker...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard reports={reports} onUpdateReports={updateReports} user={currentUser} />
        ) : (
          <DeptReportWorkflow reports={reports} onUpdateReports={updateReports} user={currentUser} />
        );
      case 'reports':
        return <PastReports reports={reports} user={currentUser} />;
      case 'settings':
        return <UserSettings user={currentUser} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Backdrop */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-xl flex flex-col">
          <SidebarContent
            user={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shadow-sm">
        <SidebarContent
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-slate-800 text-lg lg:text-xl truncate tracking-tight">
              {activeTab === 'dashboard' ? (isAdmin ? 'Admin Control' : currentUser.role === 'HOD' ? 'HoD Portal' : 'Lecturer Portal') :
                activeTab === 'reports' ? 'Records Archive' : 'System Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              {isSyncing ? (
                <div className="flex items-center gap-2 text-maroon-800 text-[10px] font-bold animate-pulse px-3 py-1 bg-maroon-50 rounded-full">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>SYNCING...</span>
                </div>
              ) : isOffline ? (
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <CloudOff size={12} />
                  <span>LOCAL MODE</span>
                </div>
              ) : syncError ? (
                <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                  <AlertTriangle size={12} />
                  <span>{syncError}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold px-3 py-1 bg-emerald-50 rounded-full">
                  <CloudCheck size={12} />
                  <span>CLOUD SYNCED</span>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={() => setActiveTab('settings')}>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none mb-1">{currentUser.name}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isAdmin ? 'Dean Office' : DEPARTMENTS.find(d => d.id === currentUser.departmentId)?.name}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <UserCircle size={28} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface SidebarProps {
  user: User;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout, onClose }) => {
  return (
    <>
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('dashboard'); onClose?.(); }}>
          <div className="bg-maroon-800 p-2.5 rounded-xl shadow-lg shadow-maroon-100">
            <Building2 className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl text-slate-900 tracking-tight leading-none">FMSC</span>
            <span className="text-[10px] font-bold text-maroon-800 uppercase tracking-[0.2em] mt-1">Tracker</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <SidebarLink
          icon={<LayoutDashboard size={20} />}
          label="Active Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => { setActiveTab('dashboard'); onClose?.(); }}
        />
        <SidebarLink
          icon={<FileCheck size={20} />}
          label="Past Reports"
          active={activeTab === 'reports'}
          onClick={() => { setActiveTab('reports'); onClose?.(); }}
        />

        <div className="pt-8 px-4 pb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FACULTY MANAGEMENT</p>
        </div>

        <SidebarLink
          icon={<Settings size={20} />}
          label="User Settings"
          active={activeTab === 'settings'}
          onClick={() => { setActiveTab('settings'); onClose?.(); }}
        />
      </nav>

      <div className="p-6">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Internal Support</p>
          <p className="text-xs text-slate-600 leading-relaxed">Having issues? Contact the Dean's Office IT Desk for assistance.</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all group border border-transparent hover:border-rose-100"
        >
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold">Sign Out</span>
        </button>
      </div>
    </>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-maroon-800 text-white shadow-lg shadow-maroon-100 translate-x-1'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <div className={active ? 'text-white' : 'text-slate-400'}>
      {icon}
    </div>
    <span className="font-bold">{label}</span>
  </button>
);

export default App;
