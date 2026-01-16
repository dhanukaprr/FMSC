
import React, { useState, useMemo } from 'react';
import { User, Report, Goal, Objective, ReportEntry, ReportStatus, EntryStatus } from '../types';
import { GOALS, OBJECTIVES, DEPARTMENTS } from '../constants';
import { Plus, Check, ChevronRight, ArrowLeft, Search, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, FileCheck, Send, Calendar, ListChecks, Edit3, Trash2, ExternalLink, Upload, FileUp, File, X } from 'lucide-react';

interface Props {
  user: User;
  reports: Report[];
  onUpdateReports: (reports: Report[]) => void;
}

type WorkflowStep = 'PERIOD_SELECT' | 'GOAL_SELECT' | 'ENTRIES' | 'SUMMARY';

const DeptReportWorkflow: React.FC<Props> = ({ user, reports, onUpdateReports }) => {
  const [step, setStep] = useState<WorkflowStep>('PERIOD_SELECT');
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentReport = useMemo(() => {
    return reports.find(r => r.id === currentReportId);
  }, [reports, currentReportId]);

  const handleStartReport = (period: string) => {
    const existing = reports.find(r => r.departmentId === user.departmentId && r.period === period);
    if (existing) {
      setCurrentReportId(existing.id);
      setStep(existing.status === 'SUBMITTED' ? 'SUMMARY' : 'GOAL_SELECT');
    } else {
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        departmentId: user.departmentId!,
        period,
        status: 'DRAFT',
        createdBy: user.id,
        selectedGoals: [],
        entries: [],
      };
      onUpdateReports([...reports, newReport]);
      setCurrentReportId(newReport.id);
      setStep('GOAL_SELECT');
    }
  };

  const updateCurrentReport = (updates: Partial<Report>) => {
    if (!currentReportId) return;
    onUpdateReports(reports.map(r => r.id === currentReportId ? { ...r, ...updates } : r));
  };

  const toggleGoal = (goalId: string) => {
    if (!currentReport || currentReport.status === 'SUBMITTED') return;
    const isSelected = currentReport.selectedGoals.includes(goalId);
    const newGoals = isSelected
      ? currentReport.selectedGoals.filter(id => id !== goalId)
      : [...currentReport.selectedGoals, goalId];
    updateCurrentReport({ selectedGoals: newGoals });
  };

  const addEntry = (obj: Objective) => {
    if (!currentReport || currentReport.status === 'SUBMITTED') return;
    const newEntry: ReportEntry = {
      id: Math.random().toString(36).substr(2, 9),
      reportId: currentReport.id,
      objectiveId: obj.id,
      status: 'In progress',
      narrative: '',
      createdAt: new Date().toISOString(),
      submittedBy: user.id,
      submittedByName: user.name,
      isApprovedByHOD: user.role === 'HOD' // HOD's own entries are auto-approved
    };
    updateCurrentReport({ entries: [...currentReport.entries, newEntry] });
  };

  const approveEntry = (entryId: string) => {
    if (user.role !== 'HOD' || !currentReport || currentReport.status === 'SUBMITTED') return;
    updateEntry(entryId, { isApprovedByHOD: true });
  };

  const updateEntry = (entryId: string, updates: Partial<ReportEntry>) => {
    if (!currentReport || currentReport.status === 'SUBMITTED') return;
    const newEntries = currentReport.entries.map(e => e.id === entryId ? { ...e, ...updates } : e);
    updateCurrentReport({ entries: newEntries });
  };

  const deleteEntry = (entryId: string) => {
    if (!currentReport || currentReport.status === 'SUBMITTED') return;
    updateCurrentReport({ entries: currentReport.entries.filter(e => e.id !== entryId) });
  };

  const handleFileUpload = (entryId: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateEntry(entryId, { evidenceUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!currentReport) return;
    if (user.role === 'LECTURER') {
      alert("Only the Head of Department can perform the final submission to the Faculty Admin.");
      return;
    }

    const unapprovedCount = currentReport.entries.filter(e => !e.isApprovedByHOD).length;
    if (unapprovedCount > 0) {
      if (!confirm(`There are ${unapprovedCount} unapproved entries. They will NOT be included in the final report to the Admin. Proceed?`)) return;
    }

    updateCurrentReport({
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      // Filter out unapproved entries if any
      entries: currentReport.entries.filter(e => e.isApprovedByHOD)
    });
    setStep('SUMMARY');
  };

  if (step === 'PERIOD_SELECT') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Monthly Progress Report</h2>
          <p className="text-slate-500 mb-8">Select the reporting period to get started or open an existing draft.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium">
                {DEPARTMENTS.find(d => d.id === user.departmentId)?.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reporting Month</label>
              <div className="flex gap-4">
                <input
                  type="month"
                  defaultValue={new Date().toISOString().slice(0, 7)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon-800 transition-all outline-none"
                  id="period-input"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('period-input') as HTMLInputElement;
                    handleStartReport(el.value);
                  }}
                  className="px-6 py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-maroon-100 transition-all"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-maroon-800" />
            Recent Reports
          </h3>
          {reports.filter(r => r.departmentId === user.departmentId).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.filter(r => r.departmentId === user.departmentId).sort((a, b) => b.period.localeCompare(a.period)).map(r => (
                <button
                  key={r.id}
                  onClick={() => { setCurrentReportId(r.id); setStep(r.status === 'SUBMITTED' ? 'SUMMARY' : 'GOAL_SELECT'); }}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-maroon-300 hover:shadow-md transition-all text-left flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-maroon-50 transition-colors">
                      <Calendar className="text-slate-400 group-hover:text-maroon-800" size={20} />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {r.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{r.period}</h4>
                  <p className="text-xs text-slate-500">{r.entries.length} objectives recorded</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
              No reports found. Start a new one above.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'GOAL_SELECT') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Relevant Goals</h2>
            <p className="text-slate-500">Select which corporate plan goals you have progress for this month.</p>
          </div>
          <button
            onClick={() => setStep('PERIOD_SELECT')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GOALS.map(goal => {
            const isSelected = currentReport?.selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all h-full flex flex-col ${isSelected
                  ? 'border-maroon-800 bg-maroon-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-maroon-200'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${isSelected ? 'bg-maroon-800 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <span className="font-bold">{goal.code}</span>
                </div>
                <h3 className={`font-bold leading-tight flex-1 ${isSelected ? 'text-maroon-950' : 'text-slate-700'}`}>
                  {goal.title}
                </h3>
                {isSelected && (
                  <div className="mt-4 flex items-center gap-1.5 text-maroon-800 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 sticky bottom-4">
          <button
            disabled={!currentReport || currentReport.selectedGoals.length === 0}
            onClick={() => setStep('ENTRIES')}
            className="px-8 py-3.5 bg-maroon-800 hover:bg-maroon-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-maroon-100 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            Continue to Objectives
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'ENTRIES') {
    const selectedGoalsList = GOALS.filter(g => currentReport?.selectedGoals.includes(g.id));
    const activeGoal = selectedGoalId && currentReport?.selectedGoals.includes(selectedGoalId)
      ? GOALS.find(g => g.id === selectedGoalId)
      : selectedGoalsList[0];

    const filteredObjectives = OBJECTIVES.filter(obj =>
      obj.goalId === activeGoal?.id &&
      (searchTerm === '' || obj.title.toLowerCase().includes(searchTerm.toLowerCase()) || obj.code.includes(searchTerm))
    );

    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] gap-6 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('GOAL_SELECT')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">Objectives Tracking</h2>
          </div>
          <button
            onClick={() => setStep('SUMMARY')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all"
          >
            Review Summary
            <FileCheck size={20} />
          </button>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Active Goals</p>
            {selectedGoalsList.map(goal => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`w-full p-4 rounded-xl text-left transition-all ${(activeGoal?.id === goal.id)
                  ? 'bg-maroon-800 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                <div className="text-xs font-bold opacity-70 mb-1">GOAL {goal.code}</div>
                <div className="font-bold text-sm leading-tight line-clamp-2">{goal.title}</div>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-maroon-50 text-maroon-800 flex items-center justify-center text-xs shrink-0">
                  {activeGoal?.code}
                </div>
                <span className="line-clamp-1">{activeGoal?.title}</span>
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search objectives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-maroon-800 transition-all outline-none text-sm w-full md:w-64"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {filteredObjectives.map(obj => {
                const subEntries = currentReport?.entries.filter(e => e.objectiveId === obj.id) || [];
                return (
                  <div key={obj.id} className="space-y-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded mt-1">{obj.code}</span>
                        <h4 className="font-bold text-slate-700 flex-1">{obj.title}</h4>
                      </div>
                      <button
                        onClick={() => addEntry(obj)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-maroon-800 bg-maroon-50 rounded-lg hover:bg-maroon-800 hover:text-white transition-all ml-4 shrink-0"
                      >
                        <Plus size={14} />
                        Add Progress
                      </button>
                    </div>

                    {subEntries.length > 0 ? (
                      <div className="grid gap-4 pl-4 border-l-2 border-maroon-100 ml-3">
                        {subEntries.map(entry => {
                          const canEdit = user.role === 'HOD' || entry.submittedBy === user.id;
                          const showApprove = user.role === 'HOD' && !entry.isApprovedByHOD;

                          return (
                            <div key={entry.id} className={`p-6 rounded-xl border space-y-4 relative group/card transition-all ${entry.isApprovedByHOD ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/30 border-amber-200 shadow-sm'}`}>
                              {canEdit && (
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}

                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                    {entry.submittedByName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-none mb-1">Submitted By</p>
                                    <p className="text-xs font-bold text-slate-800 leading-none">{entry.submittedByName} {entry.submittedBy === user.id && '(You)'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!entry.isApprovedByHOD ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">
                                      <Clock size={12} />
                                      Pending Approval
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">
                                      <CheckCircle2 size={12} />
                                      HOD Approved
                                    </div>
                                  )}
                                  {showApprove && (
                                    <button
                                      onClick={() => approveEntry(entry.id)}
                                      className="px-3 py-1 bg-maroon-800 text-white rounded text-[10px] font-bold uppercase hover:bg-maroon-900 transition-all shadow-sm"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4 text-left">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <select
                                      disabled={!canEdit}
                                      value={entry.status}
                                      onChange={(e) => updateEntry(entry.id, { status: e.target.value as EntryStatus })}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                    >
                                      <option value="Not started">Not started</option>
                                      <option value="In progress">In progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Delayed">Delayed</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Progress Narrative</label>
                                    <textarea
                                      disabled={!canEdit}
                                      rows={3}
                                      value={entry.narrative}
                                      onChange={(e) => updateEntry(entry.id, { narrative: e.target.value })}
                                      placeholder="Describe actions taken and results achieved..."
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-4 text-left">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantitative Metric</label>
                                    <input
                                      disabled={!canEdit}
                                      type="text"
                                      value={entry.metrics || ''}
                                      onChange={(e) => updateEntry(entry.id, { metrics: e.target.value })}
                                      placeholder="e.g. 5 workshops conducted"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Evidence (File or URL)</label>
                                    <div className="space-y-2">
                                      <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                                        <button
                                          disabled={!canEdit}
                                          type="button"
                                          onClick={() => updateEntry(entry.id, { evidenceUrl: '' })}
                                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${!entry.evidenceUrl?.startsWith('data:') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}
                                        >
                                          <LinkIcon size={12} />
                                          URL Link
                                        </button>
                                        <button
                                          disabled={!canEdit}
                                          type="button"
                                          onClick={() => {
                                            const input = document.getElementById(`file-${entry.id}`) as HTMLInputElement;
                                            input?.click();
                                          }}
                                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${entry.evidenceUrl?.startsWith('data:') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}
                                        >
                                          <Upload size={12} />
                                          Upload File
                                        </button>
                                      </div>

                                      {entry.evidenceUrl?.startsWith('data:') ? (
                                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="p-1.5 bg-white rounded text-emerald-600">
                                              <File size={14} />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-800 truncate text-left">File Attached</span>
                                          </div>
                                          {canEdit && (
                                            <button
                                              onClick={() => updateEntry(entry.id, { evidenceUrl: '' })}
                                              className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
                                            >
                                              <X size={14} />
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                          <input
                                            disabled={!canEdit}
                                            type="url"
                                            value={entry.evidenceUrl || ''}
                                            onChange={(e) => updateEntry(entry.id, { evidenceUrl: e.target.value })}
                                            placeholder="https://google.drive/shared-link"
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-800 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                          />
                                        </div>
                                      )}

                                      <input
                                        type="file"
                                        id={`file-${entry.id}`}
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleFileUpload(entry.id, file);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ml-10 text-xs text-slate-400 italic">No progress recorded for this objective yet.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SUMMARY') {
    if (!currentReport) return null;
    const isSubmitted = currentReport.status === 'SUBMITTED';

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Report Summary</h2>
            <p className="text-slate-500">Review your monthly progress objectives before final submission.</p>
          </div>
          {!isSubmitted && (
            <button
              onClick={() => setStep('ENTRIES')}
              className="flex items-center gap-2 px-4 py-2 text-maroon-800 font-bold hover:bg-maroon-50 rounded-lg transition-all"
            >
              <Edit3 size={18} />
              Edit Report
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Department</p>
              <p className="font-bold text-slate-800">{DEPARTMENTS.find(d => d.id === currentReport.departmentId)?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Month</p>
              <p className="font-bold text-slate-800">{currentReport.period}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isSubmitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {currentReport.status}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-12">
            {currentReport.selectedGoals.map(goalId => {
              const goal = GOALS.find(g => g.id === goalId);
              const goalEntries = currentReport.entries.filter(e => {
                const obj = OBJECTIVES.find(o => o.id === e.objectiveId);
                return obj?.goalId === goalId;
              });

              return (
                <div key={goalId} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-maroon-800">Goal {goal?.code}:</span> {goal?.title}
                  </h3>

                  {goalEntries.length > 0 ? (
                    <div className="space-y-4">
                      {goalEntries.map(entry => {
                        const obj = OBJECTIVES.find(o => o.id === entry.objectiveId);
                        return (
                          <div key={entry.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                            <div className="md:col-span-1">
                              <p className="text-xs font-bold text-slate-400 mb-1">{obj?.code}</p>
                              <p className="text-sm font-bold text-slate-700 leading-tight">{obj?.title}</p>
                              <div className="mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${entry.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                  entry.status === 'Delayed' ? 'bg-rose-50 text-rose-600' :
                                    'bg-maroon-50 text-maroon-800'
                                  }`}>
                                  {entry.status}
                                </span>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm text-slate-600 italic">"{entry.narrative || 'No narrative provided.'}"</p>
                              {entry.metrics && (
                                <p className="text-xs text-maroon-800 font-semibold mt-2">Metric: {entry.metrics}</p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-2">Reported by: {entry.submittedByName}</p>
                            </div>
                            <div className="md:col-span-1 flex flex-col items-end justify-center">
                              {entry.evidenceUrl && (
                                <a
                                  href={entry.evidenceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-maroon-800 flex items-center gap-1 hover:underline"
                                >
                                  Evidence <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic pl-4">No progress reported for this goal.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!isSubmitted ? (
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-maroon-800">
            <div className="flex items-center gap-4 text-slate-500">
              <AlertCircle className="text-amber-500" size={24} />
              <p className="text-sm">Once submitted, this report will be locked for editing.</p>
            </div>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-lg shadow-maroon-100 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              Submit Monthly Report
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-200 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900">Submission Successful</h3>
            <p className="text-emerald-700">Your report for {currentReport.period} has been sent to the Faculty Office.</p>
            <button
              onClick={() => setStep('PERIOD_SELECT')}
              className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DeptReportWorkflow;
