
import React, { useState, useMemo } from 'react';
import { Report, User, Department } from '../types';
import { DEPARTMENTS, GOALS, OBJECTIVES } from '../constants';
import { Search, Filter, Calendar, Download, Eye, FileText, ChevronRight, X, ExternalLink, Inbox } from 'lucide-react';

interface Props {
  reports: Report[];
  user: User;
}

const PastReports: React.FC<Props> = ({ reports, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  const isAdmin = user.role === 'ADMIN';

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = searchTerm === '' || r.period.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'all' || r.departmentId === filterDept;
      const matchesYear = filterYear === 'all' || r.period.startsWith(filterYear);
      const isAuthorized = isAdmin || r.departmentId === user.departmentId;
      
      return matchesSearch && matchesDept && matchesYear && isAuthorized;
    }).sort((a, b) => b.period.localeCompare(a.period));
  }, [reports, searchTerm, filterDept, filterYear, user, isAdmin]);

  const years = useMemo(() => {
    const yearsSet = new Set(reports.map(r => r.period.split('-')[0]));
    return Array.from(yearsSet).sort().reverse();
  }, [reports]);

  const viewingReport = useMemo(() => {
    return reports.find(r => r.id === viewingReportId);
  }, [reports, viewingReportId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historical Records</h2>
          <p className="text-slate-500">Access and review all past monthly submissions and drafts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
            onClick={() => alert('Exporting archive to CSV...')}
          >
            <Download size={16} />
            Bulk Export
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by period (YYYY-MM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon-800 outline-none text-sm transition-all"
          />
        </div>

        {isAdmin && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon-800 outline-none appearance-none"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon-800 outline-none appearance-none"
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <div 
              key={report.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-maroon-300 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-maroon-50 group-hover:text-maroon-800 transition-colors">
                  <FileText size={24} />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{report.period}</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">
                {DEPARTMENTS.find(d => d.id === report.departmentId)?.name}
              </p>
              
              <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-6">
                <div className="text-center flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Goals</p>
                  <p className="text-lg font-black text-slate-800">{report.selectedGoals.length}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Entries</p>
                  <p className="text-lg font-black text-slate-800">{report.entries.length}</p>
                </div>
              </div>

              <button 
                onClick={() => setViewingReportId(report.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl group-hover:bg-maroon-800 group-hover:text-white transition-all shadow-sm"
              >
                View Details
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Records Found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find specific reporting data.</p>
        </div>
      )}

      {/* Viewing Modal */}
      {viewingReportId && viewingReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingReportId(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-maroon-800 p-2.5 rounded-xl text-white">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {DEPARTMENTS.find(d => d.id === viewingReport.departmentId)?.name}
                  </h3>
                  <p className="text-sm text-slate-500">Report Archive • {viewingReport.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert('Printing record...')}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setViewingReportId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Submission Status</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    viewingReport.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {viewingReport.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Submitted At</p>
                  <p className="text-sm font-bold text-slate-700">{viewingReport.submittedAt ? new Date(viewingReport.submittedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Created By</p>
                  <p className="text-sm font-bold text-slate-700">System Admin / User ID: {viewingReport.createdBy.slice(0, 8)}</p>
                </div>
              </div>

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
                          <div key={entry.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-maroon-800 uppercase tracking-wider">{obj?.code}</p>
                                <h5 className="font-bold text-slate-800">{obj?.title}</h5>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                entry.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                entry.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
                                'bg-maroon-100 text-maroon-800'
                              }`}>
                                {entry.status}
                              </span>
                            </div>
                            
                            <div className="space-y-4">
                              <p className="text-slate-600 text-sm italic">"{entry.narrative || 'N/A'}"</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100/50">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Metrics</p>
                                  <p className="text-sm text-slate-700">{entry.metrics || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Challenges</p>
                                  <p className="text-sm text-slate-700 font-medium text-rose-600">{entry.challenges || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Support</p>
                                  <p className="text-sm text-slate-700">{entry.supportNeeded || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Evidence</p>
                                  {entry.evidenceUrl ? (
                                    <a href={entry.evidenceUrl} target="_blank" rel="noreferrer" className="text-sm text-maroon-800 font-bold hover:underline inline-flex items-center gap-1">
                                      Link <ExternalLink size={12} />
                                    </a>
                                  ) : (
                                    <p className="text-sm text-slate-300 italic">None</p>
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
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
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

export default PastReports;
