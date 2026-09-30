import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Gavel, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hearing, HearingStatus, HearingType } from '../../types';

interface HearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hearingToEdit?: Hearing;
}

export const HearingModal: React.FC<HearingModalProps> = ({
  isOpen,
  onClose,
  hearingToEdit,
}) => {
  const { addHearing, updateHearing, cases, todayDateStr } = useApp();

  const [formData, setFormData] = useState({
    caseId: cases[0]?.id || '',
    hearingDate: todayDateStr,
    hearingTime: '10:00 AM',
    courtName: 'District & Sessions Court, Lahore',
    judgeName: 'Justice Tariq Mahmood',
    hearingType: 'Bail Arguments' as HearingType,
    status: 'Scheduled' as HearingStatus,
    lawyerNotes: '',
    courtOrder: '',
    nextAction: 'File rejoinder and present citations',
  });

  useEffect(() => {
    if (hearingToEdit) {
      setFormData({
        caseId: hearingToEdit.caseId,
        hearingDate: hearingToEdit.hearingDate,
        hearingTime: hearingToEdit.hearingTime,
        courtName: hearingToEdit.courtName,
        judgeName: hearingToEdit.judgeName,
        hearingType: hearingToEdit.hearingType,
        status: hearingToEdit.status,
        lawyerNotes: hearingToEdit.lawyerNotes,
        courtOrder: hearingToEdit.courtOrder || '',
        nextAction: hearingToEdit.nextAction,
      });
    } else {
      const selectedCase = cases[0];
      setFormData({
        caseId: selectedCase?.id || '',
        hearingDate: todayDateStr,
        hearingTime: '10:00 AM',
        courtName: selectedCase?.courtName || 'District & Sessions Court, Lahore',
        judgeName: selectedCase?.judgeName || 'District & Sessions Judge',
        hearingType: 'Bail Arguments',
        status: 'Scheduled',
        lawyerNotes: '',
        courtOrder: '',
        nextAction: 'Appear and argue before the bench',
      });
    }
  }, [hearingToEdit, isOpen, cases, todayDateStr]);

  if (!isOpen) return null;

  const handleCaseChange = (cId: string) => {
    const selected = cases.find((c) => c.id === cId);
    setFormData((prev) => ({
      ...prev,
      caseId: cId,
      courtName: selected?.courtName || prev.courtName,
      judgeName: selected?.judgeName || prev.judgeName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId || !formData.hearingDate) {
      alert('Please choose a Case and Hearing Date.');
      return;
    }

    const associatedCase = cases.find((c) => c.id === formData.caseId);
    const clientId = associatedCase?.clientId || '';

    if (hearingToEdit) {
      updateHearing(hearingToEdit.id, { ...formData, clientId });
    } else {
      addHearing({ ...formData, clientId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-4 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-rose-300" />
            <h3 className="font-bold text-sm">
              {hearingToEdit ? 'Update Court Hearing' : 'Schedule Court Hearing (Section 8)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Select Case Proceeding *
              </label>
              <select
                value={formData.caseId}
                onChange={(e) => handleCaseChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.caseTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hearing Date *</label>
              <input
                type="date"
                required
                value={formData.hearingDate}
                onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hearing Time</label>
              <input
                type="text"
                value={formData.hearingTime}
                onChange={(e) => setFormData({ ...formData, hearingTime: e.target.value })}
                placeholder="e.g. 09:30 AM"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hearing Stage / Type</label>
              <select
                value={formData.hearingType}
                onChange={(e) =>
                  setFormData({ ...formData, hearingType: e.target.value as HearingType })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="Bail Arguments">Bail Arguments</option>
                <option value="Framing of Charges">Framing of Charges (Fard-e-Jurm)</option>
                <option value="Evidence">Evidence (Shahadat)</option>
                <option value="Cross-Examination">Cross-Examination (Jarah)</option>
                <option value="Final Arguments">Final Arguments (Behas-e-Akhir)</option>
                <option value="Order / Judgment">Order / Judgment (Faisla)</option>
                <option value="Status Quo">Status Quo Hearing (Hukam-e-Imtinaee)</option>
                <option value="Summon">Summon / Warrant Return</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hearing Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as HearingStatus })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Attended">Attended</option>
                <option value="Adjourned">Adjourned</option>
                <option value="Decided">Decided / Order Passed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Court Name</label>
              <input
                type="text"
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judge Name</label>
              <input
                type="text"
                value={formData.judgeName}
                onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Next Action for Lawyer / Chamber
            </label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              placeholder="e.g. Present bail citations, bring eyewitness"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lawyer Notes & Strategic Points
            </label>
            <textarea
              rows={2}
              value={formData.lawyerNotes}
              onChange={(e) => setFormData({ ...formData, lawyerNotes: e.target.value })}
              placeholder="Points for argument, witness contradictions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Court Order / Interim Direction (if already held)
            </label>
            <textarea
              rows={2}
              value={formData.courtOrder}
              onChange={(e) => setFormData({ ...formData, courtOrder: e.target.value })}
              placeholder="e.g. Adjourned for 10 days. Pre-arrest interim bail confirmed."
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
              {hearingToEdit ? 'Save Changes' : 'Schedule Hearing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
