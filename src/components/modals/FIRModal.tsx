import React, { useState, useEffect } from 'react';
import { X, FileBadge, Shield, User, Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FIRRecord, FIRStatus } from '../../types';

interface FIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  firToEdit?: FIRRecord;
}

export const FIRModal: React.FC<FIRModalProps> = ({ isOpen, onClose, firToEdit }) => {
  const { addFIR, updateFIR, clients, cases, todayDateStr, legalSections } = useApp();

  const [formData, setFormData] = useState({
    firNumber: '',
    firYear: '2026',
    firDate: todayDateStr,
    policeStation: '',
    district: 'Lahore',
    sections: '302, 324, 34 PPC',
    complainant: '',
    accused: '',
    investigatingOfficer: '',
    description: '',
    relatedCaseId: '',
    relatedClientId: '',
    status: 'Under Investigation' as FIRStatus,
  });

  useEffect(() => {
    if (firToEdit) {
      setFormData({
        firNumber: firToEdit.firNumber,
        firYear: firToEdit.firYear,
        firDate: firToEdit.firDate,
        policeStation: firToEdit.policeStation,
        district: firToEdit.district,
        sections: firToEdit.sections,
        complainant: firToEdit.complainant,
        accused: firToEdit.accused,
        investigatingOfficer: firToEdit.investigatingOfficer,
        description: firToEdit.description,
        relatedCaseId: firToEdit.relatedCaseId || '',
        relatedClientId: firToEdit.relatedClientId || '',
        status: firToEdit.status,
      });
    } else {
      setFormData({
        firNumber: '',
        firYear: '2026',
        firDate: todayDateStr,
        policeStation: '',
        district: 'Lahore',
        sections: '',
        complainant: '',
        accused: '',
        investigatingOfficer: '',
        description: '',
        relatedCaseId: '',
        relatedClientId: clients[0]?.id || '',
        status: 'Under Investigation',
      });
    }
  }, [firToEdit, isOpen, clients, todayDateStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firNumber || !formData.policeStation || !formData.sections) {
      alert('Please fill FIR Number, Police Station, and Sections.');
      return;
    }

    if (firToEdit) {
      updateFIR(firToEdit.id, formData);
    } else {
      addFIR(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-rose-300" />
            <h3 className="font-bold text-sm">
              {firToEdit ? 'Edit FIR Record' : 'Register New FIR Record (Section 7)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                FIR Number (e.g. 125/2026) *
              </label>
              <input
                type="text"
                required
                value={formData.firNumber}
                onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                placeholder="125/2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">FIR Date *</label>
              <input
                type="date"
                required
                value={formData.firDate}
                onChange={(e) => setFormData({ ...formData, firDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Police Station (Thana) *
              </label>
              <input
                type="text"
                required
                value={formData.policeStation}
                onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                placeholder="e.g. Thana Civil Lines, Lahore"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Lahore, Rawalpindi"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Sections of Law (PPC / CrPC / Special Acts) *
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Click below to insert verified Pakistan dafaat:
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.sections}
                onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                placeholder="e.g. 302, 324, 148, 149 PPC"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
              {/* Quick database-backed section tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {legalSections.slice(0, 10).map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      const tag = `${sec.sectionNumber} ${sec.lawAct.includes('PPC') ? 'PPC' : sec.lawAct.includes('CrPC') ? 'CrPC' : sec.lawAct.includes('CNSA') ? 'CNSA' : 'Act'}`;
                      if (!formData.sections) {
                        setFormData({ ...formData, sections: tag });
                      } else if (!formData.sections.includes(sec.sectionNumber)) {
                        setFormData({ ...formData, sections: `${formData.sections}, ${tag}` });
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 hover:text-rose-800 border border-slate-200 text-slate-700 transition-colors font-mono"
                    title={`${sec.sectionTitle} (${sec.status})`}
                  >
                    + {sec.sectionNumber} {sec.lawAct.includes('PPC') ? 'PPC' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Complainant (Mudai)
              </label>
              <input
                type="text"
                value={formData.complainant}
                onChange={(e) => setFormData({ ...formData, complainant: e.target.value })}
                placeholder="e.g. Sub-Inspector Ahmad"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accused Persons (Mulzimaan)
              </label>
              <input
                type="text"
                value={formData.accused}
                onChange={(e) => setFormData({ ...formData, accused: e.target.value })}
                placeholder="e.g. Muhammad Bilal & 2 others"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Investigating Officer (IO / Tafteesi)
              </label>
              <input
                type="text"
                value={formData.investigatingOfficer}
                onChange={(e) =>
                  setFormData({ ...formData, investigatingOfficer: e.target.value })
                }
                placeholder="e.g. ASI Muhammad Asif"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Police / Challan Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as FIRStatus,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="Under Investigation">Under Investigation</option>
                <option value="Challan Submitted">Challan Submitted</option>
                <option value="Bail Granted">Bail Granted</option>
                <option value="Trial in Progress">Trial in Progress</option>
                <option value="Quashed">Quashed</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Link to Registered Client
              </label>
              <select
                value={formData.relatedClientId}
                onChange={(e) => setFormData({ ...formData, relatedClientId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="">-- No direct client link --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (CNIC: {c.cnic})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Link to Court Case
              </label>
              <select
                value={formData.relatedCaseId}
                onChange={(e) => setFormData({ ...formData, relatedCaseId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="">-- No direct case link --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} ({c.caseTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              FIR Narrative (Ibtidai Ittila / Facts of Allegation)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of police complaint, incident timing, place of occurrence..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-semibold shadow-xs"
            >
              {firToEdit ? 'Update FIR Record' : 'Save FIR Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
