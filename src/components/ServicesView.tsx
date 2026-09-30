import React, { useState, useMemo } from 'react';
import {
  BadgeCheck,
  Search,
  Plus,
  Printer,
  Share2,
  Calendar,
  Building2,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  User,
  ArrowRight,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LegalServiceRecord, ServiceCategory, ServiceStatus } from '../types';
import { printElement } from '../utils/printHelper';
import { ServiceModal } from './modals/ServiceModal';
import { ServiceSlipModal } from './modals/ServiceSlipModal';

export const ServicesView: React.FC = () => {
  const {
    services,
    deleteLegalService,
    updateLegalService,
    clients,
    serviceCatalog,
    openWhatsApp,
    languageMode,
    currentRole,
    activeServicesCount,
    completedServicesCount,
    totalPendingServiceFees,
    totalPaidServiceFees,
    setSelectedClientId,
    setActiveView,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<LegalServiceRecord | undefined>(undefined);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [serviceForSlip, setServiceForSlip] = useState<LegalServiceRecord | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const categories: string[] = [
    'All',
    'Taxation & FBR',
    'Police & Verification',
    'NADRA & Succession',
    'Corporate & SECP',
    'Property & Registry',
    'Power of Attorney & Affidavits',
  ];

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const client = clients.find((c) => c.id === srv.clientId);
      const q = searchQuery.toLowerCase();

      const cName = client ? (client.fullName || client.name || '') : '';
      const cPhone = client ? (client.phone || client.mobile || '') : '';
      const cCnic = client ? client.cnic : '';

      const matchesQuery =
        !searchQuery ||
        srv.serviceTitle.toLowerCase().includes(q) ||
        srv.tokenOrChallanNo.toLowerCase().includes(q) ||
        srv.department.toLowerCase().includes(q) ||
        srv.assignedLawyer.toLowerCase().includes(q) ||
        cName.toLowerCase().includes(q) ||
        cCnic.includes(q) ||
        cPhone.includes(q);

      const matchesCategory =
        selectedCategory === 'All' || srv.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || srv.status === selectedStatus;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [services, clients, searchQuery, selectedCategory, selectedStatus]);

  const handleEdit = (srv: LegalServiceRecord) => {
    setServiceToEdit(srv);
    setIsServiceModalOpen(true);
  };

  const handleAdd = () => {
    setServiceToEdit(undefined);
    setIsServiceModalOpen(true);
  };

  const handleOpenSlip = (srv: LegalServiceRecord) => {
    setServiceForSlip(srv);
    setIsSlipModalOpen(true);
  };

  const handleSendWhatsApp = (srv: LegalServiceRecord) => {
    const client = clients.find((c) => c.id === srv.clientId);
    if (!client) return;

    const cName = client.fullName || client.name || 'Valued Client';
    const cPhone = client.phone || client.mobile || '';

    const msg = isRoman
      ? `Assalam-o-Alaikum ${cName} sb,\n\nAap ki legal service record update:\n*Service:* ${srv.serviceTitle}\n*Token/File:* ${srv.tokenOrChallanNo}\n*Department:* ${srv.department}\n*Current Status:* ${srv.status}\n*Target Date:* ${srv.targetCompletionDate}\n*Remaining Fee:* PKR ${srv.remainingAmount.toLocaleString()}\n\nKoi sawal ho to chamber se rabta farmayein.\n- Advocate Malik Tariq Hussain`
      : `Salam ${cName},\n\nUpdate regarding your legal service:\n*Service:* ${srv.serviceTitle}\n*Token #:* ${srv.tokenOrChallanNo}\n*Authority:* ${srv.department}\n*Status:* ${srv.status}\n*Balance Due:* PKR ${srv.remainingAmount.toLocaleString()}\n\nRegards,\nAdvocate Malik Tariq Hussain Chamber`;

    openWhatsApp(cPhone, msg);
  };

  const handleQuickStatusChange = (srv: LegalServiceRecord, newStatus: ServiceStatus) => {
    const updateData: Partial<LegalServiceRecord> = { status: newStatus };
    if (newStatus === 'Completed & Delivered') {
      updateData.completedDate = new Date().toISOString().split('T')[0];
    }
    updateLegalService(srv.id, updateData);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Completed & Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {status}
          </span>
        );
      case 'Clearance / Approval Granted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            {status}
          </span>
        );
      case 'Under Department Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            {status}
          </span>
        );
      case 'Department Objection':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              CHAMBER LEGAL & ADMINISTRATIVE SERVICES
            </span>
            <span className="text-xs text-slate-500 font-medium">
              (خدماتِ وکالت و فائلر/پولیس کلیئرنس)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>{isRoman ? 'Legal & Corporate Services Hub' : 'Legal & Corporate Services Management'}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {isRoman
              ? 'FBR Income Tax Returns, Police Character Clearances, NADRA Succession, SECP Registrations aur Property Services'
              : 'End-to-end tracking for FBR Tax, Police Clearances, NADRA Succession Certificates, SECP & Legal Services'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{isRoman ? 'Services Catalog' : 'Services Catalog & Rates'}</span>
          </button>

          <button
            onClick={() => printElement('services-registry-grid', 'Chamber-Legal-Services-Registry')}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{isRoman ? 'Print Summary' : 'Print Registry'}</span>
          </button>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRoman ? '+ Nayi Service Book Karein' : '+ New Service Intake'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {isRoman ? 'In-Process Services' : 'Active In-Process'}
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {activeServicesCount}
          </p>
          <span className="text-[11px] text-blue-700 font-medium">
            FBR, Police, SECP in progress
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {isRoman ? 'Clearances / Completed' : 'Completed & Delivered'}
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {completedServicesCount}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            Official Certificates Issued
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {isRoman ? 'Total Fees Recovered' : 'Fees Recovered'}
            </span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            PKR {totalPaidServiceFees.toLocaleString()}
          </p>
          <span className="text-[11px] text-teal-700 font-medium">
            Chamber revenue received
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {isRoman ? 'Pending Service Dues' : 'Pending Client Balance'}
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            PKR {totalPendingServiceFees.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">
            Outstanding upon delivery
          </span>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              isRoman
                ? 'Client ka naam, Mobile, CNIC, Service Title, Token ya Department se search karein...'
                : 'Search by client name, CNIC, phone, service title, token #, or authority...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="All">All Statuses (تمام مراحل)</option>
            <option value="Application Received">Application Received</option>
            <option value="Documents Verified">Documents Verified</option>
            <option value="Under Department Processing">Under Department Processing</option>
            <option value="Department Objection">Department Objection</option>
            <option value="Clearance / Approval Granted">Clearance / Approval Granted</option>
            <option value="Completed & Delivered">Completed & Delivered</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isRoman ? 'Koi Legal Service Record Nahi Mila' : 'No Legal Service Records Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isRoman
              ? 'Aap ne jo search filter lagaya hai us ke mutabiq koi record nahi hai. Nayi service add karne ke liye upar button dabayein.'
              : 'Try adjusting your search criteria or create a new legal service intake using the button above.'}
          </p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {isRoman ? 'Nayi Service Record Shuru Karein' : 'Book New Legal Service'}
          </button>
        </div>
      ) : (
        <div id="services-registry-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 printable-surface">
          {filteredServices.map((srv) => {
            const client = clients.find((c) => c.id === srv.clientId);
            return (
              <div
                key={srv.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      {srv.category}
                    </span>
                    {getStatusBadge(srv.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {srv.serviceTitle}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate">{srv.department}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Ref: {srv.tokenOrChallanNo}
                    </span>
                  </div>
                </div>

                {/* Client & Financial Info */}
                <div className="p-5 space-y-3 text-xs">
                  {/* Client badge */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {client?.fullName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (client) {
                              setSelectedClientId(client.id);
                              setActiveView('clients');
                            }
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-left block"
                        >
                          {client?.fullName || 'Client Record'}
                        </button>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {client?.phone} | CNIC: {client?.cnic}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(srv)}
                      title="Send WhatsApp Update"
                      className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Filing: <strong>{srv.applicationDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Target: <strong className="text-slate-800 dark:text-slate-200">{srv.targetCompletionDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Deliverable info */}
                  {srv.deliverableSummary && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-200 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                      <strong className="text-emerald-800 dark:text-emerald-300">Deliverable:</strong> {srv.deliverableSummary}
                    </div>
                  )}

                  {/* Fee Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Fee Agreed:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        PKR {srv.totalFee.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Paid:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        PKR {srv.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Balance Due:</span>
                      <span
                        className={`font-bold ${
                          srv.remainingAmount > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {srv.remainingAmount > 0
                          ? `PKR ${srv.remainingAmount.toLocaleString()}`
                          : 'Cleared ✓'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenSlip(srv)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {isRoman ? 'Print Official Slip' : 'Print Slip / Cert'}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Quick Stage Dropdown */}
                    <select
                      value={srv.status}
                      onChange={(e) => handleQuickStatusChange(srv, e.target.value as ServiceStatus)}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      <option value="Application Received">Intake</option>
                      <option value="Documents Verified">Docs Verified</option>
                      <option value="Under Department Processing">Processing</option>
                      <option value="Department Objection">Objection</option>
                      <option value="Clearance / Approval Granted">Approved</option>
                      <option value="Completed & Delivered">Delivered</option>
                    </select>

                    <button
                      onClick={() => handleEdit(srv)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {currentRole === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(isRoman ? 'Kya aap waqai is service ko delete karna chahte hain?' : 'Are you sure you want to delete this service record?')) {
                            deleteLegalService(srv.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete Service (Admin Only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chamber Services Catalog Modal */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto no-print">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Chamber Legal Services Catalog & Standard Fees</h2>
                  <p className="text-xs text-slate-300">
                    {isRoman ? 'Wakeel ki janib se faraham karda mukhtalif khidmat aur un ke sarkari idaray' : 'Standard Pakistani legal services, turnaround days, and documents required'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceCatalog.map((catItem) => (
                  <div
                    key={catItem.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {catItem.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Est: PKR {catItem.suggestedFee.toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {catItem.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {catItem.description}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3">
                        <p><strong>Department:</strong> {catItem.department}</p>
                        <p><strong>Turnaround:</strong> ~{catItem.typicalDurationDays} Business Days</p>
                        <p><strong>Required:</strong> {catItem.requiredDocuments.join(', ')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsCatalogOpen(false);
                        handleAdd();
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isRoman ? 'Is Service Ka Intake Shuru Karein' : 'Start Intake for Client'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setServiceToEdit(undefined);
        }}
        serviceToEdit={serviceToEdit}
      />

      {/* Official Service Slip & Certificate Modal */}
      <ServiceSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => {
          setIsSlipModalOpen(false);
          setServiceForSlip(null);
        }}
        service={serviceForSlip}
      />
    </div>
  );
};
