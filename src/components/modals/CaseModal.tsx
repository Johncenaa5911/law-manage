import React, { useState, useEffect } from 'react';
import { X, Briefcase, User, Calendar, Gavel, FileBadge, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Case, CaseStatus, CaseType, ClientRole } from '../../types';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: Case;
}

export const CaseModal: React.FC<CaseModalProps> = ({ isOpen, onClose, caseToEdit }) => {
  const { addCase, updateCase, clients, firs, todayDateStr, legalSections } = useApp();

  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    caseTitle: '',
    caseNumber: '',
    firNumber: '',
    firDate: '',
    caseYear: '2026',
    caseType: 'Criminal' as CaseType,
    caseCategory: 'Bail & Defense',
    courtName: 'District & Sessions Court, Lahore',
    courtLocation: 'Sessions Division Lahore',
    policeStation: '',
    district: 'Lahore',
    judgeName: '',
    complainant: '',
    accused: '',
    oppositeParty: '',
    clientRole: 'Respondent / Accused' as ClientRole,
    advocateName: 'Barrister Daniyal Khan',
    status: 'Active' as CaseStatus,
    startDate: todayDateStr,
    dafaSections: '',
    description: '',
    importantNotes: '',
  });

  useEffect(() => {
    if (caseToEdit) {
      setFormData({
        clientId: caseToEdit.clientId,
        caseTitle: caseToEdit.caseTitle,
        caseNumber: caseToEdit.caseNumber,
        firNumber: caseToEdit.firNumber || '',
        firDate: caseToEdit.firDate || '',
        caseYear: caseToEdit.caseYear,
        caseType: caseToEdit.caseType,
        caseCategory: caseToEdit.caseCategory,
        courtName: caseToEdit.courtName,
        courtLocation: caseToEdit.courtLocation,
        policeStation: caseToEdit.policeStation || '',
        district: caseToEdit.district,
        judgeName: caseToEdit.judgeName,
        complainant: caseToEdit.complainant,
        accused: caseToEdit.accused,
        oppositeParty: caseToEdit.oppositeParty,
        clientRole: caseToEdit.clientRole,
        advocateName: caseToEdit.advocateName,
        status: caseToEdit.status,
        startDate: caseToEdit.startDate,
        dafaSections: caseToEdit.dafaSections || '',
        description: caseToEdit.description,
        importantNotes: caseToEdit.importantNotes,
      });
    } else {
      setFormData({
        clientId: clients[0]?.id || '',
        caseTitle: '',
        caseNumber: '',
        firNumber: '',
        firDate: '',
        caseYear: '2026',
        caseType: 'Criminal',
        caseCategory: 'Bail Application',
        courtName: 'District & Sessions Court, Lahore',
        courtLocation: 'Sessions Division Lahore',
        policeStation: '',
        district: 'Lahore',
        judgeName: '',
        complainant: '',
        accused: '',
        oppositeParty: '',
        clientRole: 'Petitioner / Complainant' as ClientRole,
        advocateName: 'Barrister Daniyal Khan',
        status: 'Active',
        startDate: todayDateStr,
        dafaSections: '',
        description: '',
        importantNotes: '',
      });
    }
  }, [caseToEdit, isOpen, clients, todayDateStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseTitle || !formData.caseNumber || !formData.courtName) {
      alert('Please provide Case Title, Case Number, and Court Name.');
      return;
    }

    if (caseToEdit) {
      updateCase(caseToEdit.id, formData);
    } else {
      addCase(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              {caseToEdit ? 'Edit Case File' : 'Create New Legal Case (Section 6)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Client & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Representing Client *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (CNIC: {c.cnic})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Role in Proceeding *
              </label>
              <select
                value={formData.clientRole}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientRole: e.target.value as any,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="Petitioner">Petitioner (Dawa Daari)</option>
                <option value="Respondent">Respondent (Mudda Alaih)</option>
                <option value="Accused">Accused (Mulzim)</option>
                <option value="Complainant">Complainant (Mudai)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Case Title / Caption *
              </label>
              <input
                type="text"
                required
                value={formData.caseTitle}
                onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                placeholder="e.g. State vs. Muhammad Bilal & Others"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Case Number / Suit No *
              </label>
              <input
                type="text"
                required
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                placeholder="e.g. CRL-BA-124/2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Year</label>
              <input
                type="text"
                value={formData.caseYear}
                onChange={(e) => setFormData({ ...formData, caseYear: e.target.value })}
                placeholder="2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Type</label>
              <select
                value={formData.caseType}
                onChange={(e) =>
                  setFormData({ ...formData, caseType: e.target.value as CaseType })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="Criminal">Criminal (Foujdari)</option>
                <option value="Civil">Civil (Diwani)</option>
                <option value="Family">Family (Khandani)</option>
                <option value="Constitutional / Writ">Constitutional / High Court Writ</option>
                <option value="Corporate">Corporate / Commercial</option>
                <option value="Banking & Recovery">Banking & Recovery</option>
                <option value="NAB / Accountability">NAB / Accountability</option>
                <option value="Labor">Labor Court</option>
                <option value="Anti-Terrorism (ATC)">Anti-Terrorism (ATC)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as CaseStatus })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="Active">Active</option>
                <option value="Hearing">Hearing Stage</option>
                <option value="Pending">Pending</option>
                <option value="Adjourned">Adjourned</option>
                <option value="Won">Won (Decided in Favor)</option>
                <option value="Lost">Lost</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Court & Judge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Court Name *</label>
              <input
                type="text"
                required
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                placeholder="e.g. Lahore High Court, Lahore"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judge Name</label>
              <input
                type="text"
                value={formData.judgeName}
                onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                placeholder="e.g. Justice Tariq Mahmood"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Linked FIR Number (if criminal)
              </label>
              <input
                type="text"
                value={formData.firNumber}
                onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                placeholder="e.g. 142/2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Police Station</label>
              <input
                type="text"
                value={formData.policeStation}
                onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                placeholder="e.g. PS Gulberg, Lahore"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Legal Sections & Statutory Dafaat (PPC / CrPC / CPC / Special Acts)
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Click below to insert verified section:
                </span>
              </div>
              <input
                type="text"
                value={formData.dafaSections}
                onChange={(e) => setFormData({ ...formData, dafaSections: e.target.value })}
                placeholder="e.g. Section 497 CrPC, 302 PPC, Order 39 Rules 1-2 CPC"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {legalSections.slice(0, 8).map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      const tag = `${sec.sectionNumber} ${sec.lawAct.includes('PPC') ? 'PPC' : sec.lawAct.includes('CrPC') ? 'CrPC' : sec.lawAct.includes('CPC') ? 'CPC' : 'Act'}`;
                      if (!formData.dafaSections) {
                        setFormData({ ...formData, dafaSections: tag });
                      } else if (!formData.dafaSections.includes(sec.sectionNumber)) {
                        setFormData({ ...formData, dafaSections: `${formData.dafaSections}, ${tag}` });
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 text-slate-700 transition-colors font-mono"
                    title={`${sec.sectionTitle} (${sec.status})`}
                  >
                    + {sec.sectionNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Complainant</label>
              <input
                type="text"
                value={formData.complainant}
                onChange={(e) => setFormData({ ...formData, complainant: e.target.value })}
                placeholder="e.g. The State / Tariq"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accused</label>
              <input
                type="text"
                value={formData.accused}
                onChange={(e) => setFormData({ ...formData, accused: e.target.value })}
                placeholder="e.g. Muhammad Bilal"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opposite Party</label>
              <input
                type="text"
                value={formData.oppositeParty}
                onChange={(e) => setFormData({ ...formData, oppositeParty: e.target.value })}
                placeholder="e.g. State Counsel"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description & Strategy */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Case Brief / Synopsis
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of legal facts and grounds..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lawyer Strategy & Confidential Instructions
            </label>
            <textarea
              rows={2}
              value={formData.importantNotes}
              onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
              placeholder="Key citations, weaknesses in prosecution, witness questions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xs"
            >
              {caseToEdit ? 'Update Case File' : 'Save Case Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
