
import React, { useState, useMemo } from 'react';
import { Report, Department, User, ReportStatus } from '../types';
import { DEPARTMENTS, GOALS, OBJECTIVES } from '../constants';
import { BarChart3, Users, FileCheck, Clock, Search, Filter, Download, ChevronRight, Eye, RefreshCw, CheckCircle2, AlertCircle, Calendar, X, Database, ShieldCheck, ShieldAlert, Target, LayoutGrid, List, ChevronDown } from 'lucide-react';

interface Props {
  user: User;
  reports: Report[];
  onUpdateReports: (reports: Report[]) => void;
}

const AdminDashboard: React.FC<Props> = ({ user, reports, onUpdateReports }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dept' | 'goal'>('dept');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [dbMessage, setDbMessage] = useState<string>('');

  const stats = useMemo(() => {
    const periodReports = reports.filter(r => r.period === selectedMonth);
    const submitted = periodReports.filter(r => r.status === 'SUBMITTED').length;
    return {
      total: DEPARTMENTS.length,
      submitted,
      pending: DEPARTMENTS.length - submitted,
      submissionRate: Math.round((submitted / DEPARTMENTS.length) * 100) || 0
    };
  }, [reports, selectedMonth]);

  const testConnection = async () => {
    setDbStatus('TESTING');
    try {
      const res = await fetch('/.netlify/functions/api?test=true');
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setDbStatus('CONNECTED');
        setDbMessage('Successfully linked to Neon DB.');
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setDbStatus('ERROR');
      setDbMessage(err.message || 'Check DATABASE_URL in Netlify.');
    }
  };

  const viewingReport = useMemo(() => {
    return reports.find(r => r.id === viewingReportId);
  }, [reports, viewingReportId]);

  const goalData = useMemo(() => {
    const periodReports = reports.filter(r => r.period === selectedMonth);
    return GOALS.map(goal => {
      const goalEntries = periodReports.flatMap(report =>
        report.entries
          .filter(entry => {
            const obj = OBJECTIVES.find(o => o.id === entry.objectiveId);
            return obj?.goalId === goal.id;
          })
          .map(entry => ({
            ...entry,
            deptName: DEPARTMENTS.find(d => d.id === report.departmentId)?.name || 'Unknown'
          }))
      );
      return {
        ...goal,
        entries: goalEntries
      };
    });
  }, [reports, selectedMonth]);

  const requestRevision = (reportId: string) => {
    if (!confirm('Are you sure you want to request a revision for this report? It will be unlocked for the department.')) return;
    onUpdateReports(reports.map(r => r.id === reportId ? { ...r, status: 'REVISION_REQUESTED' } : r));
    setViewingReportId(null);
  };

  const acceptReport = (reportId: string) => {
    if (!confirm('Are you sure you want to accept this report? It will be marked as final.')) return;
    onUpdateReports(reports.map(r => r.id === reportId ? { ...r, status: 'ACCEPTED' } : r));
    setViewingReportId(null);
  };

  const toggleGoal = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Database Diagnostic Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dbStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600' :
            dbStatus === 'ERROR' ? 'bg-rose-50 text-rose-600' :
              'bg-slate-50 text-slate-400'
            }`}>
            <Database size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Infrastructure Status</p>
            <p className="text-sm font-semibold text-slate-700">
              {dbStatus === 'IDLE' && 'Database status unknown'}
              {dbStatus === 'TESTING' && 'Connecting to Neon...'}
              {dbStatus === 'CONNECTED' && dbMessage}
              {dbStatus === 'ERROR' && dbMessage}
            </p>
          </div>
        </div>
        <button
          onClick={testConnection}
          disabled={dbStatus === 'TESTING'}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
        >
          {dbStatus === 'TESTING' ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Test Connection
        </button>
      </div>

      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="text-maroon-800" size={24} />}
          label="Total Departments"
          value={stats.total.toString()}
        />
        <StatCard
          icon={<FileCheck className="text-emerald-600" size={24} />}
          label="Reports Submitted"
          value={stats.submitted.toString()}
          suffix={`(${stats.submissionRate}%)`}
        />
        <StatCard
          icon={<Clock className="text-amber-600" size={24} />}
          label="Pending Submissions"
          value={stats.pending.toString()}
        />
        <StatCard
          icon={<BarChart3 className="text-rose-600" size={24} />}
          label="Total Items Reported"
          value={reports.filter(r => r.period === selectedMonth).reduce((acc, curr) => acc + curr.entries.length, 0).toString()}
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('dept')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'dept' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Users size={14} />
                By Department
              </div>
            </button>
            <button
              onClick={() => setViewMode('goal')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'goal' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Target size={14} />
                By Goal
              </div>
            </button>
          </div>

          {viewMode === 'goal' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${displayMode === 'grid' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-lg transition-all ${displayMode === 'list' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none"
            />
          </div>
          {viewMode === 'dept' && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none appearance-none"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={() => alert('Exporting aggregated data for ' + selectedMonth + ' to CSV...')}
          className="flex items-center gap-2 px-4 py-2 bg-maroon-800 text-white text-sm font-bold rounded-lg hover:bg-maroon-900 transition-all shadow-lg shadow-maroon-100"
        >
          <Download size={16} />
          Export Month Data
        </button>
      </div>

      {/* View Content */}
      {viewMode === 'dept' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Objectives</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEPARTMENTS.filter(d => selectedDept === 'all' || d.id === selectedDept).map(dept => {
                  const report = reports.find(r => r.departmentId === dept.id && r.period === selectedMonth);
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{dept.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{selectedMonth}</span>
                      </td>
                      <td className="px-6 py-4">
                        {report ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${report.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                            report.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                              report.status === 'REVISION_REQUESTED' ? 'bg-rose-100 text-rose-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                            {report.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400">
                            NOT STARTED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{report?.entries.length || 0} reported</p>
                      </td>
                      <td className="px-6 py-4">
                        {report ? (
                          <button
                            onClick={() => setViewingReportId(report.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-maroon-800 bg-maroon-50 rounded-lg hover:bg-maroon-800 hover:text-white transition-all"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No report</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          {goalData.map(goal => {
            const isExpanded = expandedGoals.has(goal.id);
            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="bg-maroon-800 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">Goal {goal.code}</span>
                  <h3 className="text-sm font-bold text-slate-800 truncate flex-1">{goal.title}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{goal.entries.length} Contributions</span>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/30">
                    <div className="mt-6">
                      {goal.entries.length > 0 ? (
                        <div className={displayMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                          {goal.entries.map(entry => {
                            const obj = OBJECTIVES.find(o => o.id === entry.objectiveId);
                            return (
                              <div key={entry.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="text-[10px] font-bold text-maroon-800 uppercase tracking-wider mb-1">{entry.deptName}</p>
                                    <h4 className="text-xs font-bold text-slate-800 leading-tight">Objective {obj?.code}: {obj?.title}</h4>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${entry.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                    entry.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
                                      'bg-maroon-100 text-maroon-800'
                                    }`}>
                                    {entry.status}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 italic line-clamp-3 mb-4">"{entry.narrative || 'No narrative provided...'}"</p>
                                <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-slate-50 pt-4">
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase mb-1">Metrics</p>
                                    <p className="text-slate-700 truncate">{entry.metrics || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase mb-1">Evidence</p>
                                    {entry.evidenceUrl ? (
                                      <a href={entry.evidenceUrl} target="_blank" rel="noreferrer" className="text-maroon-800 font-bold hover:underline">View Evidence</a>
                                    ) : (
                                      <p className="text-slate-300">None</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle size={32} className="opacity-10 mb-2" />
                          <p className="text-xs italic">No contributions reported for this goal in {selectedMonth}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Viewing Modal */}
      {viewingReportId && viewingReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingReportId(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {DEPARTMENTS.find(d => d.id === viewingReport.departmentId)?.name}
                </h3>
                <p className="text-sm text-slate-500">Progress Summary • {viewingReport.period}</p>
              </div>
              <div className="flex items-center gap-3">
                {viewingReport.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => acceptReport(viewingReport.id)}
                      className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold rounded-xl transition-all"
                    >
                      <CheckCircle2 size={18} />
                      Accept Report
                    </button>
                    <button
                      onClick={() => requestRevision(viewingReport.id)}
                      className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold rounded-xl transition-all"
                    >
                      <RefreshCw size={18} />
                      Request Revision
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingReportId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {viewingReport.selectedGoals.length > 0 ? viewingReport.selectedGoals.map(goalId => {
                const goal = GOALS.find(g => g.id === goalId);
                const entries = viewingReport.entries.filter(e => {
                  const obj = OBJECTIVES.find(o => o.id === e.objectiveId);
                  return obj?.goalId === goalId;
                });

                return (
                  <div key={goalId} className="space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-3 pb-2 border-b border-slate-100">
                      <span className="bg-maroon-800 text-white px-2 py-0.5 rounded text-sm shrink-0">Goal {goal?.code}</span>
                      <span className="truncate">{goal?.title}</span>
                    </h4>

                    <div className="space-y-4">
                      {entries.map(entry => {
                        const obj = OBJECTIVES.find(o => o.id === entry.objectiveId);
                        return (
                          <div key={entry.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-maroon-800 uppercase tracking-wider">{obj?.code}</p>
                                <h5 className="font-bold text-slate-800">{obj?.title}</h5>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${entry.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                entry.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
                                  'bg-maroon-100 text-maroon-800'
                                }`}>
                                {entry.status}
                              </span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Progress Narrative</p>
                                <p className="text-slate-600 text-sm italic">"{entry.narrative || 'N/A'}"</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100/50">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Metrics</p>
                                  <p className="text-sm text-slate-700">{entry.metrics || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Challenges</p>
                                  <p className="text-sm text-slate-700">{entry.challenges || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Support Needed</p>
                                  <p className="text-sm text-slate-700">{entry.supportNeeded || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Evidence</p>
                                  {entry.evidenceUrl ? (
                                    <a href={entry.evidenceUrl} target="_blank" rel="noreferrer" className="text-sm text-maroon-800 font-bold hover:underline">
                                      {entry.evidenceUrl.startsWith('data:') ? 'View File' : 'View Link'}
                                    </a>
                                  ) : (
                                    <p className="text-sm text-slate-300">None</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle size={48} className="opacity-10 mb-2" />
                  <p>No goals were selected for this report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; suffix?: string }> = ({ icon, label, value, suffix }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {suffix && <span className="text-xs text-slate-500 font-medium">{suffix}</span>}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
