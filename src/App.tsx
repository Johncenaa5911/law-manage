import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { Dashboard } from './components/Dashboard';
import { ClientsView } from './components/ClientsView';
import { CasesView } from './components/CasesView';
import { FIRView } from './components/FIRView';
import { HearingsView } from './components/HearingsView';
import { DocumentsView } from './components/DocumentsView';
import { PaymentsView } from './components/PaymentsView';
import { ServicesView } from './components/ServicesView';
import { ReportsView } from './components/ReportsView';
import { CalendarView } from './components/CalendarView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { LoginView } from './components/LoginView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { TeamManagementModal } from './components/TeamManagementModal';

// Modals
import { SmartSearchModal } from './components/SmartSearchModal';
import { ShareModal, ShareData } from './components/ShareModal';
import { ClientModal } from './components/modals/ClientModal';
import { CaseModal } from './components/modals/CaseModal';
import { FIRModal } from './components/modals/FIRModal';
import { HearingModal } from './components/modals/HearingModal';
import { DocumentModal } from './components/modals/DocumentModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { GoogleDriveModal } from './components/modals/GoogleDriveModal';
import { GmailBackupModal } from './components/modals/GmailBackupModal';

import { Client, Case, FIRRecord, Hearing, DocumentItem } from './types';

const MainLayout: React.FC = () => {
  const {
    isLoggedIn,
    activeView,
    currentUser,
    isGoogleDriveModalOpen,
    setIsGoogleDriveModalOpen,
    driveTargetDoc,
    showOnboarding,
    setShowOnboarding,
    isTeamModalOpen,
    setIsTeamModalOpen,
    isGmailBackupModalOpen,
    setIsGmailBackupModalOpen,
  } = useApp();

  // Modal states
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | undefined>(undefined);

  const [firModalOpen, setFirModalOpen] = useState(false);
  const [editingFir, setEditingFir] = useState<FIRRecord | undefined>(undefined);

  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState<Hearing | undefined>(undefined);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | undefined>(undefined);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [shareData, setShareData] = useState<ShareData | null>(null);

  // Modal openers
  const handleOpenClientModal = (client?: Client) => {
    setEditingClient(client);
    setClientModalOpen(true);
  };

  const handleOpenCaseModal = (caseItem?: Case) => {
    setEditingCase(caseItem);
    setCaseModalOpen(true);
  };

  const handleOpenFirModal = (fir?: FIRRecord) => {
    setEditingFir(fir);
    setFirModalOpen(true);
  };

  const handleOpenHearingModal = (hearing?: Hearing) => {
    setEditingHearing(hearing);
    setHearingModalOpen(true);
  };

  const handleOpenDocModal = (doc?: DocumentItem) => {
    setEditingDoc(doc);
    setDocModalOpen(true);
  };

  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Super Admin has a completely independent dedicated dashboard with ZERO lawyer data
  if (currentUser.role === 'super_admin') {
    return <SuperAdminPortal />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onOpenClientModal={() => handleOpenClientModal()}
          onOpenCaseModal={() => handleOpenCaseModal()}
          onOpenHearingModal={() => handleOpenHearingModal()}
          onOpenDocModal={() => handleOpenDocModal()}
        />

        <main className="flex-1 overflow-y-auto pb-24 sm:pb-12 focus:outline-hidden bg-slate-50/60 text-slate-900">
          {activeView === 'dashboard' && (
            <Dashboard
              onOpenClientModal={() => handleOpenClientModal()}
              onOpenCaseModal={() => handleOpenCaseModal()}
              onOpenHearingModal={handleOpenHearingModal}
              onOpenDocModal={() => handleOpenDocModal()}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'clients' && (
            <ClientsView
              onOpenClientModal={handleOpenClientModal}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'cases' && (
            <CasesView
              onOpenCaseModal={handleOpenCaseModal}
              onOpenHearingModal={() => handleOpenHearingModal()}
              onOpenDocModal={handleOpenDocModal}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'firs' && (
            <FIRView
              onOpenFIRModal={handleOpenFirModal}
              onOpenDocModal={handleOpenDocModal}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'hearings' && (
            <HearingsView
              onOpenHearingModal={handleOpenHearingModal}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'documents' && (
            <DocumentsView
              onOpenDocModal={handleOpenDocModal}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'payments' && (
            <PaymentsView
              onOpenPaymentModal={() => setPaymentModalOpen(true)}
              onOpenShareModal={(data) => setShareData(data)}
            />
          )}

          {activeView === 'services' && <ServicesView />}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'calendar' && (
            <CalendarView onOpenShareModal={(data) => setShareData(data)} />
          )}

          {activeView === 'activity' && <ActivityView />}

          {activeView === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Phone Bottom Navigation Bar */}
        <BottomNavBar />
      </div>

      {/* Global Modals */}
      <SmartSearchModal />

      <ShareModal
        data={shareData}
        onClose={() => setShareData(null)}
      />

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        clientToEdit={editingClient}
      />

      <CaseModal
        isOpen={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        caseToEdit={editingCase}
      />

      <FIRModal
        isOpen={firModalOpen}
        onClose={() => setFirModalOpen(false)}
        firToEdit={editingFir}
      />

      <HearingModal
        isOpen={hearingModalOpen}
        onClose={() => setHearingModalOpen(false)}
        hearingToEdit={editingHearing}
      />

      <DocumentModal
        isOpen={docModalOpen}
        onClose={() => {
          setDocModalOpen(false);
          setEditingDoc(undefined);
        }}
        docToEdit={editingDoc}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        targetDocToUpload={driveTargetDoc}
      />

      {/* Lawyer Personal Gmail & Cloud Sync Modal */}
      <GmailBackupModal
        isOpen={isGmailBackupModalOpen}
        onClose={() => setIsGmailBackupModalOpen(false)}
      />

      {/* Team Management Modal for Firm Admin */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Customer Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
