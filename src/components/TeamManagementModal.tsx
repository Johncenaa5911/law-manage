import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Check,
  X,
  Lock,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FirmMember, UserRole, FirmPermissions } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ASSISTANT_PERMISSIONS: FirmPermissions = {
  canManageClients: true,
  canManageCases: true,
  canManageFirs: true,
  canManageHearings: true,
  canManageDocuments: true,
  canViewFinancials: false, // Locked by default for assistants
  canManagePayments: false,
  canManageTeam: false,
  canManageFirm: false,
};

const DEFAULT_LAWYER_PERMISSIONS: FirmPermissions = {
  canManageClients: true,
  canManageCases: true,
  canManageFirs: true,
  canManageHearings: true,
  canManageDocuments: true,
  canViewFinancials: true,
  canManagePayments: true,
  canManageTeam: false,
  canManageFirm: false,
};

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentFirm, firmMembers, addFirmMember, removeFirmMember, currentUser } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'lawyer' as UserRole,
    barLicenseNo: '',
  });

  const [permissions, setPermissions] = useState<FirmPermissions>(DEFAULT_LAWYER_PERMISSIONS);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setFormData({ ...formData, role: newRole });
    if (newRole === 'assistant' || newRole === 'clerk') {
      setPermissions(DEFAULT_ASSISTANT_PERMISSIONS);
    } else {
      setPermissions(DEFAULT_LAWYER_PERMISSIONS);
    }
  };

  const handleTogglePermission = (key: keyof FirmPermissions) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill member name and email.');
      return;
    }

    const newMember: FirmMember = {
      id: `usr_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      firmId: currentFirm.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      barLicenseNo: formData.barLicenseNo,
      joinedAt: new Date().toISOString().split('T')[0],
      permissions,
    };

    addFirmMember(newMember);
    setIsAddOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'lawyer',
      barLicenseNo: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                {currentFirm.name}
              </div>
              <h2 className="text-base font-bold text-white">Chamber Team & Permissions</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Active members header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lawyers & Staff ({firmMembers.length})</h3>
              <p className="text-slate-500 text-[11px]">
                Manage chamber associate advocates and assistants with role-based access control.
              </p>
            </div>
            {!isAddOpen && (
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Lawyer / Staff</span>
              </button>
            )}
          </div>

          {/* Add member form */}
          {isAddOpen && (
            <form onSubmit={handleAddMember} className="p-5 bg-slate-50 rounded-2xl border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs">Invite New Chamber Member</span>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="Advocate Asadullah Khan / Munshi Ramzan"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="member@chamber.pk"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="+92 300 0000000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Capacity *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="lawyer">Associate Advocate (Lawyer)</option>
                    <option value="assistant">Assistant / Court Munshi (Staff)</option>
                    <option value="firm_admin">Partner / Co-Firm Admin</option>
                  </select>
                </div>

                {formData.role === 'lawyer' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Bar License / Sanad Number</label>
                    <input
                      type="text"
                      value={formData.barLicenseNo}
                      onChange={(e) => setFormData({ ...formData, barLicenseNo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="e.g. LHC-2026-4412"
                    />
                  </div>
                )}
              </div>

              {/* Granular Permission Toggles */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Role-Based Permissions Matrix:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { key: 'canManageClients', label: 'Manage Clients' },
                    { key: 'canManageCases', label: 'Manage Cases' },
                    { key: 'canManageFirs', label: 'Manage FIRs' },
                    { key: 'canManageHearings', label: 'Manage Hearings' },
                    { key: 'canManageDocuments', label: 'Upload Documents' },
                    { key: 'canViewFinancials', label: 'View Fee Financials (Restricted)' },
                    { key: 'canManagePayments', label: 'Add/Issue Receipts' },
                    { key: 'canManageTeam', label: 'Manage Chamber Team' },
                  ].map(({ key, label }) => {
                    const isAllowed = permissions[key as keyof FirmPermissions];
                    const isFinancial = key === 'canViewFinancials' || key === 'canManagePayments';
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleTogglePermission(key as keyof FirmPermissions)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isAllowed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="truncate pr-1">
                          {isFinancial && <Lock className="w-3 h-3 inline-block mr-1 text-slate-400" />}
                          {label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isAllowed
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isAllowed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm"
                >
                  Save Member & Issue Credentials
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Financials Access</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {firmMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-500">{member.email} • {member.phone || 'No phone'}</div>
                      {member.barLicenseNo && (
                        <div className="text-[10px] text-amber-700 font-mono mt-0.5">Bar: {member.barLicenseNo}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        member.role === 'firm_admin'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : member.role === 'lawyer'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                      }`}>
                        {member.role === 'assistant' ? 'Munshi / Clerk' : member.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {member.permissions?.canViewFinancials ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Authorized
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          Restricted
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {member.joinedAt || '2025-01-01'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {member.userId !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from chamber?`)) {
                              removeFirmMember(member.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close Team Manager
          </button>
        </div>
      </div>
    </div>
  );
};
