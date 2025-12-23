
import React, { useState, useEffect, useCallback } from 'react';
import { User, Report, Department, UserRole } from './types';
import { DEPARTMENTS } from './constants';
import { LogIn, LayoutDashboard, FileText, Settings, LogOut, Building2, UserCircle, Menu, X, RefreshCw, CloudCheck } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import DeptReportWorkflow from './components/DeptReportWorkflow';
import LoginForm from './components/LoginForm';

const API_BASE = '/.netlify/functions/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');

  // Load User from session and Reports from DB
  useEffect(() => {
    const savedUser = localStorage.getItem('fmsc_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports`);
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error("Failed to load reports from DB:", err);
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
  };

  const updateReports = useCallback(async (updatedReports: Report[]) => {
    setReports(updatedReports);
    
    // Find the report that was actually changed to sync it
    // In a real app, we might only sync the specific report object
    setIsSyncing(true);
    try {
      // For this simplified logic, we find the "active" or "newest" report to sync
      // Ideally, the components would trigger individual syncs
      const latestReport = updatedReports[updatedReports.length - 1];
      if (latestReport) {
        await fetch(`${API_BASE}/reports`, {
          method: 'POST',
          body: JSON.stringify(latestReport)
        });
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-800"></div>
          <p className="text-slate-500 font-medium animate-pulse">Connecting to FMSC Cloud...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Mobile Toggle */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-xl flex flex-col">
          <SidebarContent 
            user={currentUser} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
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
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-slate-800 text-lg lg:text-xl truncate">
              {isAdmin ? 'Admin Portal' : 'Department Portal'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isSyncing ? (
              <div className="flex items-center gap-2 text-maroon-800 text-xs font-bold animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving to Cloud...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold opacity-60">
                <CloudCheck size={14} />
                <span>Synchronized</span>
              </div>
            )}
            
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
              <span className="text-xs text-slate-500">
                {isAdmin ? 'Faculty Office' : DEPARTMENTS.find(d => d.id === currentUser.departmentId)?.name || 'Department'}
              </span>
            </div>
            <UserCircle className="text-slate-400" size={32} />
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' ? (
            isAdmin ? (
              <AdminDashboard 
                reports={reports} 
                onUpdateReports={updateReports} 
                user={currentUser} 
              />
            ) : (
              <DeptReportWorkflow 
                reports={reports} 
                onUpdateReports={updateReports} 
                user={currentUser} 
              />
            )
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Historical Reports view coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'reports') => void;
  onLogout: () => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout, onClose }) => {
  return (
    <>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-maroon-800 p-2 rounded-lg">
            <Building2 className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">FMSC Tracker</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 p-1 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <SidebarLink 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => { setActiveTab('dashboard'); onClose?.(); }} 
        />
        <SidebarLink 
          icon={<FileText size={20} />} 
          label="Reports" 
          active={activeTab === 'reports'} 
          onClick={() => { setActiveTab('reports'); onClose?.(); }} 
        />
        <div className="pt-4 mt-4 border-t border-slate-100">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Management</p>
          <SidebarLink 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={false} 
            onClick={() => { onClose?.(); }} 
          />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
      active 
        ? 'bg-maroon-50 text-maroon-800 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={active ? 'text-maroon-800' : 'text-slate-400'}>
      {icon}
    </div>
    <span className="font-semibold">{label}</span>
  </button>
);

export default App;
