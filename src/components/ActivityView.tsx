import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  Trash2,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityLog } from '../types';

export const ActivityView: React.FC = () => {
  const { activities, languageMode, currentUser } = useApp();
  const isRoman = languageMode === 'romanUrdu';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesCategory =
        selectedCategory === 'all' || act.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        act.action.toLowerCase().includes(q) ||
        act.details.toLowerCase().includes(q) ||
        act.userName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activities, selectedCategory, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Category', 'Action', 'Details'];
    const rows = filteredActivities.map((a) => [
      a.id,
      a.timestamp,
      `"${a.userName}"`,
      a.userRole,
      a.category,
      `"${a.action}"`,
      `"${a.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chamber_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: ActivityLog['category']) => {
    const map: Record<string, { label: string; color: string }> = {
      case: { label: 'Case File', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
      client: { label: 'Client', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
      fir: { label: 'FIR Record', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
      hearing: { label: 'Court Hearing', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
      payment: { label: 'Fee / Payment', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
      document: { label: 'Document', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
      service: { label: 'Legal Service', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
      auth: { label: 'Security & Auth', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    };

    const c = map[category] || { label: category, color: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.color}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isRoman ? 'Chamber Audit Trail' : 'Chamber Security & Activity Log'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isRoman ? 'Chamber Activity & Action History' : 'Audit Trail & Activity Log'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRoman
              ? 'Cases, clients, legal services, firs aur payments ki har tabdeeli ka digital record'
              : 'Tamper-evident legal audit log of all case actions, hearings, services, and receipts'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          {isRoman ? 'Export CSV Log' : 'Export Audit CSV'}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              isRoman
                ? 'Activity action, details ya user se filter karein...'
                : 'Search audit records by action or detail...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="case">Cases</option>
            <option value="client">Clients</option>
            <option value="service">Legal Services</option>
            <option value="hearing">Hearings</option>
            <option value="payment">Payments</option>
            <option value="fir">FIR Records</option>
            <option value="document">Documents</option>
            <option value="auth">System & Auth</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching activity records found.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(act.category)}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {act.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {act.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {act.userName} ({act.userRole})
                  </span>
                  <span className="font-mono text-slate-400">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
