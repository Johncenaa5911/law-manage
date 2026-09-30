import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Briefcase,
  Users,
  FileBadge,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Building2,
  DollarSign,
  BadgeCheck,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  QrCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { printElement } from '../utils/printHelper';

export const ReportsView: React.FC = () => {
  const {
    cases,
    clients,
    firs,
    hearings,
    documents,
    payments,
    services,
    currentUser,
    todayDateStr,
    languageMode,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';

  type ReportType =
    | 'fullCase'
    | 'causeList'
    | 'servicesReport'
    | 'clientProfile'
    | 'financialStatement'
    | 'vakalatnama';

  const [reportType, setReportType] = useState<ReportType>('fullCase');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'all');

  const targetCase = cases.find((c) => c.id === selectedCaseId);
  const targetClient = clients.find(
    (cl) => cl.id === (reportType === 'fullCase' ? targetCase?.clientId : selectedClientId)
  );
  const targetFir = targetCase?.firNumber
    ? firs.find((f) => f.firNumber === targetCase.firNumber)
    : null;
  const targetHearings = targetCase
    ? hearings.filter((h) => h.caseId === targetCase.id)
    : [];
  const targetDocs = targetCase
    ? documents.filter((d) => d.caseId === targetCase.id)
    : [];
  const targetPayments = targetCase
    ? payments.filter((p) => p.caseId === targetCase.id)
    : [];

  const clientCases = targetClient ? cases.filter((c) => c.clientId === targetClient.id) : [];
  const clientServices = targetClient ? services.filter((s) => s.clientId === targetClient.id) : [];
  const clientPayments = targetClient ? payments.filter((p) => p.clientId === targetClient.id) : [];

  const handlePrint = () => {
    printElement('printable-report-surface', `Chamber-Report-${reportType}`);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header (No-Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isRoman ? 'Official Chamber Legal Printing' : 'Legal Documentation & Print System'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isRoman ? 'Court & Chamber Reports Print Center' : 'Legal Print Center & Official Reports'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRoman
              ? 'Complete Case File, Cause List, Services Slip, Client Statement, Fees Ledger aur Vakalatnama print karein'
              : 'Official court dossiers, daily cause lists, administrative service certificates, client ledgers, and Vakalatnama forms'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isRoman ? 'Print Document (PDF)' : 'Print Document / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Selection Bar (No-Print) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isRoman ? 'Report Ka Intikhab Karein:' : 'Select Printable Legal Document:'}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Standard A4 High Court Chamber Print Formatting
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setReportType('fullCase')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'fullCase'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4 mx-auto mb-1 opacity-80" />
            Case Dossier
          </button>

          <button
            onClick={() => setReportType('causeList')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'causeList'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4 mx-auto mb-1 opacity-80" />
            Daily Cause List
          </button>

          <button
            onClick={() => setReportType('servicesReport')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'servicesReport'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BadgeCheck className="w-4 h-4 mx-auto mb-1 opacity-80" />
            Legal Services
          </button>

          <button
            onClick={() => setReportType('clientProfile')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'clientProfile'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4 mx-auto mb-1 opacity-80" />
            Client Statement
          </button>

          <button
            onClick={() => setReportType('financialStatement')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'financialStatement'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4 mx-auto mb-1 opacity-80" />
            Fees Ledger
          </button>

          <button
            onClick={() => setReportType('vakalatnama')}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
              reportType === 'vakalatnama'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4 mx-auto mb-1 opacity-80" />
            وکالت نامہ فارم
          </button>
        </div>

        {/* Dynamic Selector for the Active Report Type */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          {reportType === 'fullCase' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {isRoman ? 'Case Select Karein:' : 'Target Case File:'}
              </span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.caseTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(reportType === 'clientProfile' || reportType === 'vakalatnama') && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {isRoman ? 'Client Select Karein:' : 'Target Client:'}
              </span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.fullName} ({cl.cnic}) — {cl.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'servicesReport' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {isRoman ? 'Service Filter:' : 'Service Scope:'}
              </span>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Chamber Legal Services Registry (تمام سروسز)</option>
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    [{srv.category}] {srv.serviceTitle} — Ref: {srv.tokenOrChallanNo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Document Surface */}
      <div id="printable-report-surface" className="printable-surface bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md p-8 md:p-12 font-serif max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* Law Firm Letterhead */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center relative">
          <div className="flex items-start justify-between">
            <div className="text-left font-sans text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-6 h-6 text-emerald-900" />
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-950 font-serif">
                  {currentUser.name}
                </h1>
              </div>
              <p className="font-semibold text-emerald-950">
                {currentUser.courtEnrollment} • Roll No: {currentUser.barLicenseNo}
              </p>
              <p className="text-slate-600 mt-0.5">{currentUser.chamberAddress}</p>
              <p className="text-slate-600">
                Phone: {currentUser.phone} • Email: {currentUser.email}
              </p>
            </div>

            <div className="text-right font-sans text-xs shrink-0">
              <div className="px-3 py-1 bg-emerald-900 text-white rounded font-bold uppercase tracking-wider text-[11px] inline-block mb-1">
                {reportType === 'fullCase' && 'CASE FILE DOSSIER'}
                {reportType === 'causeList' && 'DAILY CAUSE LIST'}
                {reportType === 'servicesReport' && 'LEGAL SERVICES REGISTRY'}
                {reportType === 'clientProfile' && 'CLIENT LEGAL DOSSIER'}
                {reportType === 'financialStatement' && 'CHAMBER RECOVERY LEDGER'}
                {reportType === 'vakalatnama' && 'POWER OF ATTORNEY (وکالت نامہ)'}
              </div>
              <div className="text-slate-500">Date: {todayDateStr}</div>
              <div className="text-slate-400 font-mono text-[10px]">VERIFIED SYSTEM COPY</div>
            </div>
          </div>
        </div>

        {/* 1. Complete Case Report */}
        {reportType === 'fullCase' && targetCase && (
          <div className="space-y-6 text-xs font-sans">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                1. Client & Represented Party Details
              </h2>
              <div className="grid grid-cols-2 gap-3 mt-2 p-2">
                <div><strong>Client Full Name:</strong> {targetClient?.fullName || 'N/A'}</div>
                <div><strong>Father / Husband:</strong> {targetClient?.fatherOrHusbandName || 'N/A'}</div>
                <div><strong>CNIC Number:</strong> <span className="font-mono">{targetClient?.cnic || 'N/A'}</span></div>
                <div><strong>Contact Phone:</strong> {targetClient?.phone || 'N/A'}</div>
                <div><strong>Residential Address:</strong> {targetClient?.address}, {targetClient?.city}</div>
                <div><strong>Client Role in Proceeding:</strong> {targetCase.clientRole}</div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                2. Case Particulars & Court Registry
              </h2>
              <div className="grid grid-cols-2 gap-3 mt-2 p-2">
                <div><strong>Case Title:</strong> {targetCase.caseTitle}</div>
                <div><strong>Case Number:</strong> <span className="font-mono font-bold">{targetCase.caseNumber}</span></div>
                <div><strong>Jurisdiction / Court:</strong> {targetCase.courtName}</div>
                <div><strong>Presiding Judge:</strong> {targetCase.judgeName}</div>
                <div><strong>Case Category:</strong> {targetCase.caseType} ({targetCase.caseCategory})</div>
                <div><strong>Current Court Status:</strong> <span className="font-bold text-emerald-800">{targetCase.status}</span></div>
                <div><strong>Complainant / Petitioner:</strong> {targetCase.complainant}</div>
                <div><strong>Accused / Respondent:</strong> {targetCase.accused}</div>
              </div>
              {targetCase.description && (
                <div className="mt-2 p-2 bg-slate-50 rounded text-slate-700 leading-relaxed">
                  <strong>Brief Facts & Pleadings:</strong> {targetCase.description}
                </div>
              )}
            </div>

            {targetFir && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                  3. Connected Police FIR Information
                </h2>
                <div className="grid grid-cols-2 gap-3 mt-2 p-2">
                  <div><strong>FIR Number:</strong> <span className="font-mono font-bold">{targetFir.firNumber}/{targetFir.firYear}</span></div>
                  <div><strong>Police Station:</strong> {targetFir.policeStation} ({targetFir.district})</div>
                  <div><strong>Sections of Law (PPC):</strong> <span className="font-mono font-bold">{targetFir.sections}</span></div>
                  <div><strong>Investigating Officer:</strong> {targetFir.investigatingOfficer}</div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                4. Court Hearing History & Cause List Record
              </h2>
              <table className="w-full text-left border border-slate-200 mt-2">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-2">Date & Time</th>
                    <th className="p-2">Stage</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Court Order / Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {targetHearings.map((h) => (
                    <tr key={h.id}>
                      <td className="p-2 font-mono">{h.hearingDate} {h.hearingTime}</td>
                      <td className="p-2 font-semibold">{h.hearingType}</td>
                      <td className="p-2">{h.status}</td>
                      <td className="p-2 text-slate-600">{h.courtOrder || h.lawyerNotes || 'Proceedings recorded'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                5. Fee & Financial Recovery Statement
              </h2>
              <div className="mt-2 space-y-1">
                {targetPayments.map((p) => (
                  <div key={p.id} className="p-2 bg-slate-50 rounded border flex justify-between">
                    <span>Receipt: <strong>{p.receiptNumber}</strong> ({p.paymentDate}) via {p.paymentMethod}</span>
                    <span className="font-mono">Paid: <strong>PKR {p.paidAmount.toLocaleString()}</strong> / Agreed: PKR {p.totalFee.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 items-end">
              <div className="text-[10px] text-slate-500">
                Verified from Wakalat Legal Information System • High Court Bar Lahore
              </div>
              <div className="text-right">
                <div className="border-t border-slate-400 w-44 ml-auto pt-1 font-bold text-center">
                  {currentUser.name}
                  <div className="text-[10px] font-normal text-slate-500">Advocate High Court</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Cause List Report */}
        {reportType === 'causeList' && (
          <div className="space-y-4 text-xs font-sans">
            <h2 className="text-base font-bold text-center uppercase tracking-wide border-b pb-2">
              Official Court Daily Cause List (روزانہ عدالتی کاز لسٹ) • {todayDateStr}
            </h2>

            <table className="w-full text-left border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Case Number</th>
                  <th className="p-2.5">Case Title</th>
                  <th className="p-2.5">Court & Bench</th>
                  <th className="p-2.5">Stage</th>
                  <th className="p-2.5">Advocate Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hearings.map((h) => {
                  const c = cases.find((item) => item.id === h.caseId);
                  return (
                    <tr key={h.id}>
                      <td className="p-2.5 font-bold font-mono">{h.hearingTime}</td>
                      <td className="p-2.5 font-bold font-mono text-slate-900">{c?.caseNumber}</td>
                      <td className="p-2.5">{c?.caseTitle}</td>
                      <td className="p-2.5">{h.courtName} ({h.judgeName})</td>
                      <td className="p-2.5 font-semibold">{h.hearingType}</td>
                      <td className="p-2.5 text-slate-600">{h.lawyerNotes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
              <span className="text-[10px] text-slate-500">
                Total Hearings Today: {hearings.filter((h) => h.hearingDate === todayDateStr).length} Scheduled
              </span>
              <div className="text-center font-bold">
                {currentUser.name}
                <div className="text-[10px] font-normal text-slate-500">Advocate High Court</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Legal Services Report */}
        {reportType === 'servicesReport' && (
          <div className="space-y-4 text-xs font-sans">
            <h2 className="text-base font-bold text-center uppercase tracking-wide border-b pb-2">
              Legal & Administrative Services Intake & Clearance Registry (رجسٹر خدماتِ وکالت)
            </h2>

            <table className="w-full text-left border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2">Token / Ref #</th>
                  <th className="p-2">Client Name</th>
                  <th className="p-2">Service Title</th>
                  <th className="p-2">Authority / Dept</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Fee (PKR)</th>
                  <th className="p-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {services
                  .filter((s) => selectedServiceId === 'all' || s.id === selectedServiceId)
                  .map((srv) => {
                    const cl = clients.find((c) => c.id === srv.clientId);
                    return (
                      <tr key={srv.id}>
                        <td className="p-2 font-mono font-bold">{srv.tokenOrChallanNo}</td>
                        <td className="p-2 font-medium">{cl?.fullName}</td>
                        <td className="p-2 font-semibold text-slate-900">{srv.serviceTitle}</td>
                        <td className="p-2">{srv.department}</td>
                        <td className="p-2">
                          <span className="font-semibold text-emerald-800">{srv.status}</span>
                        </td>
                        <td className="p-2 text-right font-mono">{srv.totalFee.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {srv.remainingAmount > 0 ? srv.remainingAmount.toLocaleString() : 'Nil'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 border rounded-lg flex justify-between font-bold">
              <span>Total Services Listed: {services.length}</span>
              <span>
                Total Fee: PKR {services.reduce((a, b) => a + b.totalFee, 0).toLocaleString()} | Outstanding Balance: PKR {services.reduce((a, b) => a + b.remainingAmount, 0).toLocaleString()}
              </span>
            </div>

            <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
              <span className="text-[10px] text-slate-500">Official Chamber Clearance Register</span>
              <div className="text-center font-bold">
                {currentUser.name}
                <div className="text-[10px] font-normal text-slate-500">Advocate High Court</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Client Profile & Consolidated Ledger */}
        {reportType === 'clientProfile' && targetClient && (
          <div className="space-y-6 text-xs font-sans">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded text-slate-900 border-l-4 border-slate-900">
                CLIENT CONSOLIDATED LEGAL DOSSIER (موکل مکمل کوائف و ریکارڈ)
              </h2>
              <div className="grid grid-cols-2 gap-3 mt-2 p-2">
                <div><strong>Full Name:</strong> {targetClient.fullName}</div>
                <div><strong>Father / Husband:</strong> {targetClient.fatherOrHusbandName}</div>
                <div><strong>CNIC No:</strong> <span className="font-mono font-bold">{targetClient.cnic}</span></div>
                <div><strong>Mobile:</strong> {targetClient.phone}</div>
                <div><strong>Email:</strong> {targetClient.email || 'N/A'}</div>
                <div><strong>Residential Address:</strong> {targetClient.address}, {targetClient.city}</div>
              </div>
            </div>

            {/* Client Cases */}
            <div>
              <h3 className="font-bold text-slate-800 uppercase mb-1">Active Cases Represented ({clientCases.length}):</h3>
              <table className="w-full text-left border border-slate-200">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-2">Case #</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Court</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientCases.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 font-mono font-bold">{c.caseNumber}</td>
                      <td className="p-2 font-semibold">{c.caseTitle}</td>
                      <td className="p-2">{c.courtName}</td>
                      <td className="p-2">{c.clientRole}</td>
                      <td className="p-2 font-bold text-emerald-800">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Client Services */}
            <div>
              <h3 className="font-bold text-slate-800 uppercase mb-1">Chamber Legal Services ({clientServices.length}):</h3>
              <table className="w-full text-left border border-slate-200">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-2">Token #</th>
                    <th className="p-2">Service Title</th>
                    <th className="p-2">Department</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientServices.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 font-mono font-bold">{s.tokenOrChallanNo}</td>
                      <td className="p-2 font-semibold">{s.serviceTitle}</td>
                      <td className="p-2">{s.department}</td>
                      <td className="p-2 font-bold text-emerald-800">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Client Payments */}
            <div>
              <h3 className="font-bold text-slate-800 uppercase mb-1">Financial Fee Ledger:</h3>
              <table className="w-full text-left border border-slate-200">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-2">Receipt #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Method</th>
                    <th className="p-2 text-right">Agreed Fee</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 font-mono font-bold">{p.receiptNumber}</td>
                      <td className="p-2">{p.paymentDate}</td>
                      <td className="p-2">{p.paymentMethod}</td>
                      <td className="p-2 text-right font-mono">{p.totalFee.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">{p.paidAmount.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-700">{p.remainingAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
              <span className="text-[10px] text-slate-500">Chamber Confidential Client Dossier</span>
              <div className="text-center font-bold">
                {currentUser.name}
                <div className="text-[10px] font-normal text-slate-500">Advocate High Court</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Financial Ledger Report */}
        {reportType === 'financialStatement' && (
          <div className="space-y-4 text-xs font-sans">
            <h2 className="text-base font-bold text-center uppercase tracking-wide border-b pb-2">
              CHAMBER FEE RECOVERY & ACCOUNTS STATEMENT (کھاتہ فیس و بقایا جات)
            </h2>

            <table className="w-full text-left border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2">Receipt #</th>
                  <th className="p-2">Client Name</th>
                  <th className="p-2">Payment Date</th>
                  <th className="p-2">Method</th>
                  <th className="p-2 text-right">Total Fee (PKR)</th>
                  <th className="p-2 text-right">Paid Amount</th>
                  <th className="p-2 text-right">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((p) => {
                  const cl = clients.find((c) => c.id === p.clientId);
                  return (
                    <tr key={p.id}>
                      <td className="p-2 font-mono font-bold">{p.receiptNumber}</td>
                      <td className="p-2 font-medium">{cl?.fullName}</td>
                      <td className="p-2">{p.paymentDate}</td>
                      <td className="p-2">{p.paymentMethod}</td>
                      <td className="p-2 text-right font-mono">{p.totalFee.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">{p.paidAmount.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-700">
                        {p.remainingAmount > 0 ? p.remainingAmount.toLocaleString() : 'Cleared'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4 bg-slate-50 border rounded-xl grid grid-cols-3 text-center">
              <div>
                <span className="text-slate-500 block">Total Billed Fees</span>
                <span className="text-base font-bold">
                  PKR {payments.reduce((a, b) => a + b.totalFee, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Recovered</span>
                <span className="text-base font-bold text-emerald-700">
                  PKR {payments.reduce((a, b) => a + b.paidAmount, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Outstanding Recovery</span>
                <span className="text-base font-bold text-amber-700">
                  PKR {payments.reduce((a, b) => a + b.remainingAmount, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
              <span className="text-[10px] text-slate-500">Chamber Financial Accounts Audit</span>
              <div className="text-center font-bold">
                {currentUser.name}
                <div className="text-[10px] font-normal text-slate-500">Advocate High Court</div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Official Vakalatnama Template */}
        {reportType === 'vakalatnama' && (
          <div className="space-y-6 text-slate-950 font-serif leading-relaxed">
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-slate-950">
                وکالت نامہ (VAKALATNAMA)
              </h2>
              <p className="text-xs font-sans text-slate-600 mt-1">
                عدالت عالیہ / سیشن ڈویژن و متعلقہ عدالت ہائے مجاز
              </p>
            </div>

            <div className="text-sm font-sans space-y-3 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
              <p>
                <strong>بخدمت جناب:</strong> عدالت مجاز / فاضل جج صاحب سیشن کورٹ / ہائیکورٹ لاہور
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>عنوانِ مقدمہ:</strong> {targetCase?.caseTitle || 'مقدمہ بابت کاروائی قانونی'}
                </div>
                <div>
                  <strong>نمبر مقدمہ / ایف آئی آر:</strong> {targetCase?.caseNumber || 'زیرِ اندراج'}
                </div>
              </div>
            </div>

            <div className="text-xs font-sans leading-loose text-justify text-slate-800 p-2">
              باعثِ تحریر آں کہ میں / ہم مسمی/مسمات <strong>{targetClient?.fullName || '...........................'}</strong> ولد/زوجہ <strong>{targetClient?.fatherOrHusbandName || '...........................'}</strong> ساکن <strong>{targetClient?.address || '...........................'}</strong> شناختی کارڈ نمبر <strong>{targetClient?.cnic || '...........................'}</strong> اپنی جانب سے مقدمہ / کاروائی مندرجہ بالا میں <strong>{currentUser.name}</strong> ایڈووکیٹ ہائیکورٹ کو اپنا وکیل مقرر کرتا/کرتی ہوں۔
              <br />
              وکیل موصوف کو مکمل اختیار حاصل ہو گا کہ وہ میری جانب سے عرضی دعویٰ، جواب دعویٰ، ضمانت، اپیل، نظرثانی، رٹ پیٹیشن یا دیگر متعلقہ کاغذات داخل فرمائیں، پیشی پر حاضر ہوں، بحث کریں اور ہر قسم کا بیان ریکارڈ کرائیں۔ وکیل صاحب کا ہر قانونی اقدام میرے اپنے اقدام کے مترادف ہو گا۔
            </div>

            {/* Execution / Signatures */}
            <div className="pt-12 grid grid-cols-2 gap-8 font-sans text-xs">
              <div className="text-center border-t-2 border-slate-800 pt-2">
                <p className="font-bold text-slate-900">{targetClient?.fullName || 'موکل / سائل'}</p>
                <p className="text-slate-500 font-mono">CNIC: {targetClient?.cnic || '.....................'}</p>
                <p className="text-[10px] text-slate-400 mt-1">(دستخط یا نشانِ انگوٹھا موکل)</p>
              </div>

              <div className="text-center border-t-2 border-slate-800 pt-2">
                <p className="font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-emerald-950 font-semibold">{currentUser.courtEnrollment}</p>
                <p className="text-slate-500 font-mono">License: {currentUser.barLicenseNo}</p>
                <p className="text-[10px] text-slate-400 mt-1">(وکالت نامہ قبول کنندہ ایڈووکیٹ)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
