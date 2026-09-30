import React, { useState } from 'react';
import {
  Scale,
  Building,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccountType, SubscriptionPlan } from '../types';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa (KPK)',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const PRACTICE_AREA_OPTIONS = [
  'Criminal Law & FIR Defense',
  'Civil Litigation & Property Suits',
  'Family, Dower & Child Custody',
  'Constitutional Petitions & High Court Writs',
  'Banking & Financial Recovery',
  'Corporate & SECP Compliance',
  'Taxation & FBR Active Taxpayer',
  'Anti-Terrorism (ATC) Defense',
  'Cybercrime & PECA Litigation',
  'Narcotics (CNSA) Bail Arguments',
  'Labor & Service Tribunal Writs',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { currentUser, setCurrentUser, currentFirm, updateFirm, languageMode } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states initialized with user's actual profile, without hardcoded demo contamination
  const [formData, setFormData] = useState({
    lawyerName: currentUser?.name || '',
    barLicenseNo: currentUser?.barLicenseNo || '',
    courtEnrollment: currentUser?.courtEnrollment || 'Advocate High Court',
    accountType: (currentFirm?.accountType || 'lawfirm') as AccountType,
    firmName: currentFirm?.name || currentUser?.firmName || (currentUser?.name ? `Chamber of Adv. ${currentUser.name}` : ''),
    email: currentUser?.email || '',
    phone: currentUser?.phone || currentFirm?.phone || '',
    officeAddress: currentUser?.chamberAddress || currentFirm?.officeAddress || '',
    city: currentFirm?.city || currentUser?.city || 'Lahore',
    province: currentFirm?.province || 'Punjab',
    barCouncil: 'Punjab Bar Council',
    practiceAreas: currentFirm?.practiceAreas?.length
      ? currentFirm.practiceAreas
      : ['Criminal Law & FIR Defense', 'Civil Litigation & Property Suits', 'Family, Dower & Child Custody'],
    plan: 'professional' as SubscriptionPlan,
  });

  const togglePracticeArea = (area: string) => {
    if (formData.practiceAreas.includes(area)) {
      setFormData({
        ...formData,
        practiceAreas: formData.practiceAreas.filter((a) => a !== area),
      });
    } else {
      setFormData({
        ...formData,
        practiceAreas: [...formData.practiceAreas, area],
      });
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate unique firm workspace ID
    const newFirmId =
      currentFirm?.id && currentFirm.id !== 'firm_lahore_chambers'
        ? currentFirm.id
        : `firm_${Date.now()}`;

    // Update user profile
    setCurrentUser({
      ...currentUser,
      name: formData.lawyerName,
      email: formData.email,
      phone: formData.phone,
      firmId: newFirmId,
      firmName: formData.firmName,
      barLicenseNo: formData.barLicenseNo,
      courtEnrollment: formData.courtEnrollment,
      officeAddress: formData.officeAddress,
      city: formData.city,
      province: formData.province,
      accountType: formData.accountType,
      role: 'firm_admin',
      practiceAreas: formData.practiceAreas,
      onboardingCompleted: true,
    });

    // Update firm workspace
    updateFirm({
      id: newFirmId,
      name: formData.firmName,
      ownerId: currentUser.id,
      accountType: formData.accountType,
      plan: formData.plan,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      officeAddress: formData.officeAddress,
      city: formData.city,
      province: formData.province,
      country: 'Pakistan',
      phone: formData.phone,
      email: formData.email,
      barCouncil: formData.barCouncil,
      practiceAreas: formData.practiceAreas,
      createdAt: new Date().toISOString().split('T')[0],
      currency: 'PKR',
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col my-auto">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/30 backdrop-blur-sm flex items-center justify-center border border-amber-400/40">
              <Scale className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-200">
                  Wakalat Commercial Onboarding
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Step {step} of 4
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {step === 1 && 'Lawyer & Bar Credentials'}
                {step === 2 && 'Law Firm & Chamber Workspace'}
                {step === 3 && 'Practice Areas & Specialization'}
                {step === 4 && 'Commercial Plan & Launch'}
              </h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === s
                    ? 'bg-amber-400 scale-125 shadow-md shadow-amber-400/50'
                    : step > s
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Step 1: Lawyer & Bar Credentials */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
                Welcome to <strong className="text-amber-400 font-bold">WAKALAT Enterprise</strong>. Please configure your advocate identity. Every record created will be securely tagged with your verified credentials.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Advocate / Lawyer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lawyerName}
                    onChange={(e) => setFormData({ ...formData, lawyerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    placeholder="e.g. Advocate Muhammad Ahmad Khan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bar License / Sanad Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barLicenseNo}
                    onChange={(e) => setFormData({ ...formData, barLicenseNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="e.g. LHC-2026-9812 / SBC-14022"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Court Enrollment Tier *
                  </label>
                  <select
                    value={formData.courtEnrollment}
                    onChange={(e) => setFormData({ ...formData, courtEnrollment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Advocate High Court">Advocate High Court</option>
                    <option value="Advocate Subordinate / District Courts">Advocate Subordinate / District Courts</option>
                    <option value="Senior Advocate Supreme Court">Senior Advocate Supreme Court</option>
                    <option value="Barrister-at-Law">Barrister-at-Law (Lincoln's Inn / Inner Temple)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Provincial Bar Council *
                  </label>
                  <select
                    value={formData.barCouncil}
                    onChange={(e) => setFormData({ ...formData, barCouncil: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Punjab Bar Council">Punjab Bar Council</option>
                    <option value="Sindh Bar Council">Sindh Bar Council</option>
                    <option value="Khyber Pakhtunkhwa Bar Council">Khyber Pakhtunkhwa Bar Council</option>
                    <option value="Balochistan Bar Council">Balochistan Bar Council</option>
                    <option value="Islamabad Bar Council">Islamabad Bar Council</option>
                    <option value="Pakistan Bar Council (Supreme Court)">Pakistan Bar Council (Supreme Court)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                  Practice Account Architecture *
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'individual' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.accountType === 'individual'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-amber-300 mb-0.5">Individual Solo Advocate</div>
                    <div className="text-[11px] text-slate-400">
                      Personal workspace. Isolated clients, diary, and case files.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'lawfirm' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.accountType === 'lawfirm'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-amber-300 mb-0.5">Multi-Lawyer Law Firm / Chamber</div>
                    <div className="text-[11px] text-slate-400">
                      Chamber workspace with multiple partner lawyers and munshis/clerks.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Law Firm & Chamber Workspace */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
                Setup your official Chamber profile. This will appear on printable client dossiers, case power of attorneys (Vakalatnamas), and fee receipts.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Firm / Chamber Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    placeholder="e.g. Ahmad & Partners Legal Chambers"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Official Chamber Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="chamber@domain.pk"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone / WhatsApp Helpline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    City / Principal Seat *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Lahore / Islamabad / Karachi"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Province *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    {PAKISTAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Chamber Office Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.officeAddress}
                    onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Chamber Room, Bar Council Building, High Court"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Practice Areas & Specialization */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
                Select your law firm's core practice disciplines. This customizes your legal forms and instant Pakistan Statutory Sections (PPC, CrPC, CPC, QSO, etc.).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRACTICE_AREA_OPTIONS.map((area) => {
                  const isSelected = formData.practiceAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => togglePracticeArea(area)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{area}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-amber-400 border-amber-300 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Commercial Plan & Launch */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>
                  <strong>Your 30-Day Commercial Free Trial</strong> has been automatically unlocked! Zero upfront payment required.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => setFormData({ ...formData, plan: 'starter' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.plan === 'starter'
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 opacity-70'
                  }`}
                >
                  <div className="font-bold text-amber-300 text-sm">Starter Advocate</div>
                  <div className="text-xl font-black text-white mt-1">Rs. 4,500<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
                  <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                    <li>✓ 1 Solo Lawyer</li>
                    <li>✓ Up to 150 Active Cases</li>
                    <li>✓ FIR & Bail Tracker</li>
                    <li>✓ Cloud Storage 10 GB</li>
                  </ul>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, plan: 'professional' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                    formData.plan === 'professional'
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
                      : 'bg-slate-800/60 border-slate-700 opacity-70'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full uppercase">
                    Recommended
                  </div>
                  <div className="font-bold text-amber-300 text-sm">Chamber Pro</div>
                  <div className="text-xl font-black text-white mt-1">Rs. 9,500<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
                  <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                    <li>✓ Up to 5 Associate Lawyers</li>
                    <li>✓ Unlimited Cases & FIRs</li>
                    <li>✓ Role-based Munshi Access</li>
                    <li>✓ WhatsApp Sharing & PDF Dossiers</li>
                    <li>✓ Cloud Storage 50 GB</li>
                  </ul>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, plan: 'enterprise' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.plan === 'enterprise'
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 opacity-70'
                  }`}
                >
                  <div className="font-bold text-amber-300 text-sm">Enterprise Firm</div>
                  <div className="text-xl font-black text-white mt-1">Rs. 19,500<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
                  <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                    <li>✓ Unlimited Lawyers & Staff</li>
                    <li>✓ Multi-Branch Chamber Support</li>
                    <li>✓ Custom Subdomain & Branding</li>
                    <li>✓ Dedicated Database Isolation</li>
                    <li>✓ VIP 24/7 Telephone Support</li>
                  </ul>
                </div>
              </div>

              {/* Summary box */}
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Workspace Configuration Summary:</div>
                <div className="text-white font-medium">
                  {formData.firmName} • {formData.lawyerName} ({formData.courtEnrollment})
                </div>
                <div className="text-slate-400 text-[11px]">
                  {formData.officeAddress}, {formData.city}, {formData.province} • {formData.phone}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all active:scale-95 uppercase tracking-wider"
            >
              <span>Launch Chamber Workspace</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
