import React, { useState } from 'react';
import {
  Scale,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  User,
  Briefcase,
  ShieldCheck,
  Building2,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const {
    loginLawyer,
    registerLawyer,
    loginSuperAdmin,
    languageMode,
    setLanguageMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lawyer' | 'register' | 'superadmin'>('lawyer');

  // Strictly empty initial inputs - No preloaded credentials
  const [lawyerEmail, setLawyerEmail] = useState('');
  const [lawyerPassword, setLawyerPassword] = useState('');

  // New Lawyer Registration inputs - 100% clean pristine data
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirmName, setRegFirmName] = useState('');
  const [regCity, setRegCity] = useState('');

  // Super Admin Login Form - No preloaded credentials
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleLawyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!lawyerEmail.trim() || !lawyerPassword.trim()) {
      setErrorMessage('Please enter both your authorized email/Gmail and password.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const res = await loginLawyer(lawyerEmail.trim(), lawyerPassword.trim());
      if (!res.success) {
        setErrorMessage(res.message || 'Access denied. Unauthorized credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to chamber cloud workspace.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please provide advocate name, email/Gmail, and password.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const res = await registerLawyer({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        firmName: regFirmName.trim() || `${regName.trim()} Law Chambers`,
        city: regCity.trim() || 'Pakistan',
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating independent chamber workspace.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMessage('Please enter master admin username and password.');
      return;
    }
    const res = loginSuperAdmin(adminUsername.trim(), adminPassword.trim());
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid Super Admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
      {/* Background Ambience */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls: Language Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguageMode(languageMode === 'romanUrdu' ? 'english' : 'romanUrdu')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>{languageMode === 'romanUrdu' ? '🇵🇰 Roman Urdu' : '🇬🇧 English'}</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 border border-amber-300">
            <Scale className="w-9 h-9 text-slate-950 stroke-[2.2]" />
          </div>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white uppercase flex items-center justify-center gap-2">
          <span>WAKALAT</span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-extrabold dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/40">
            PRO
          </span>
        </h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1.5 max-w-sm mx-auto leading-relaxed">
          {languageMode === 'romanUrdu'
            ? 'Commercial Multi-Lawyer Legal Case & Practice Cloud Suite'
            : 'Enterprise Legal Case & Client Management Platform for Pakistan'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 shadow-xl shadow-slate-200/60 dark:shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          {/* 3 Navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('lawyer');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'lawyer'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('superadmin');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'superadmin'
                  ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/80 rounded-xl text-rose-900 dark:text-white text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5" />
              <div className="leading-snug font-bold">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: Lawyer & Law Firm Login */}
          {activeTab === 'lawyer' && (
            <form onSubmit={handleLawyerSubmit} className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed bg-amber-50/70 dark:bg-slate-950/80 p-3.5 rounded-xl border border-amber-200/80 dark:border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="font-medium">
                  Apne registered law firm email ya Gmail ke sath login karein. Har chamber ka data 100% private aur isolated hota hai.
                </span>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1.5 text-xs">
                  Authorized Chamber Email or Gmail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={lawyerEmail}
                    onChange={(e) => setLawyerEmail(e.target.value)}
                    placeholder="e.g. advocate@chamber.pk ya apna@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1.5 text-xs">
                  Chamber Password / Secret PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="off"
                    value={lawyerPassword}
                    onChange={(e) => setLawyerPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono font-bold shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Verifying & Syncing Cloud Chamber...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Lawyer Workspace</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: New Advocate & Law Chamber Registration */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed bg-emerald-50/80 dark:bg-slate-950/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium">
                  {languageMode === 'romanUrdu'
                    ? 'Naya law chamber register karein. Aapka dashboard 100% clean aur doosray wakeelon se bilkul alag hoga.'
                    : 'Register your independent law chamber. Your practice workspace is strictly isolated with 0 initial records.'}
                </span>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1 text-xs">
                  Advocate Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Advocate Muhammad Aslam"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1 text-xs">
                  Email or Gmail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. advocate@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1 text-xs">
                  Chamber Password / Secret PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-900 dark:text-white font-bold mb-1 text-xs">
                    Law Firm / Chamber Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-slate-400" />
                    <input
                      type="text"
                      value={regFirmName}
                      onChange={(e) => setRegFirmName(e.target.value)}
                      placeholder="e.g. Aslam Law Associates"
                      className="w-full pl-9 pr-2.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 dark:text-white font-bold mb-1 text-xs">
                    City / Bar Council
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Lahore / Karachi"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-wider cursor-pointer mt-2"
              >
                {isAuthenticating ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Creating Clean Chamber Workspace...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Chamber & Start Practice</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: Super Admin Master Login (Exclusive to Software Owner) */}
          {activeTab === 'superadmin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-200 dark:border-purple-700/60 text-xs text-purple-950 dark:text-white leading-relaxed">
                <strong className="text-purple-900 dark:text-purple-300 font-bold block mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Software Platform Owner Access:
                </strong>
                Manage customer law firms, authorize emails/passwords, control subscription plans, and update Pakistan legal sections.
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1.5 text-xs">
                  Master Admin Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold mb-1.5 text-xs">
                  Super Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="off"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-slate-900/25 dark:shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Access Master Admin Console</span>
              </button>
            </form>
          )}

          {/* Footer Assistance & Security Notice */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              Protected by Enterprise Multi-Tenant Isolation & 256-bit Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
