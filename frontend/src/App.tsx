import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PersonaSwitcher } from './components/PersonaSwitcher';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { CloudTopologyModal } from './components/CloudTopologyModal';
import { NewJoinerGuideModal } from './components/NewJoinerGuideModal';
import { SystemBlueprintModal } from './components/SystemBlueprintModal';

// Pages
import { ChatAssistantPage } from './pages/ChatAssistantPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { WorkplaceHubPage } from './pages/WorkplaceHubPage';
import { UploadDocumentPage } from './pages/UploadDocumentPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { SupportTicketsPage } from './pages/SupportTicketsPage';
import { KnowledgeAnalyticsPage } from './pages/KnowledgeAnalyticsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { SettingsPage } from './pages/SettingsPage';

import { apiService } from './services/apiService';
import { DocumentItem } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isTopologyOpen, setIsTopologyOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkTheme]);

  const handleToggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const handleOpenDocPreview = (docId: string) => {
    const allDocs = apiService.getAllDocumentsForAdmin();
    const doc = allDocs.find(d => d.id === docId) || null;
    setPreviewDoc(doc);
  };

  return (
    <div className="app-layout" id="enterpriseiq-app-root">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'topology') {
            setIsTopologyOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenTopology={() => setIsTopologyOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Top Navbar */}
        <Navbar
          onOpenTopology={() => setIsTopologyOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenBlueprint={() => setIsBlueprintOpen(true)}
          isDarkTheme={isDarkTheme}
          onToggleTheme={handleToggleTheme}
        />

        {/* RBAC Persona Quick-Switcher Bar */}
        <PersonaSwitcher />

        {/* Dynamic Page Rendering */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chat' && (
            <ChatAssistantPage 
              onViewDocument={handleOpenDocPreview}
              onNavigateToTickets={() => setActiveTab('tickets')}
              onNavigateToWorkplace={(tab) => setActiveTab(tab || 'workplace')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateToChat={() => setActiveTab('chat')}
              onNavigateToDocs={() => setActiveTab('documents')}
              onNavigateToWorkplace={() => setActiveTab('workplace')}
              onNavigateToTickets={() => setActiveTab('tickets')}
              onNavigateToApprovals={() => setActiveTab('approvals')}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onViewDoc={handleOpenDocPreview}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentLibraryPage
              onViewDocument={handleOpenDocPreview}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'workplace' && (
            <WorkplaceHubPage
              onNavigateToChat={() => setActiveTab('chat')}
              onViewDoc={handleOpenDocPreview}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsPage
              onViewDocument={handleOpenDocPreview}
            />
          )}

          {activeTab === 'tickets' && (
            <SupportTicketsPage
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}

          {activeTab === 'analytics' && (
            <KnowledgeAnalyticsPage />
          )}

          {activeTab === 'upload' && (
            <UploadDocumentPage
              onUploadSuccess={(docId) => {
                setActiveTab('documents');
                handleOpenDocPreview(docId);
              }}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardPage
              onNavigateToAudit={() => setActiveTab('audit')}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsPage />
          )}

          {activeTab === 'feedback' && (
            <FeedbackPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Document Inspector Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* AWS Cloud Architecture Topology Modal */}
      {isTopologyOpen && (
        <CloudTopologyModal
          onClose={() => setIsTopologyOpen(false)}
        />
      )}

      {/* New Joiner Onboarding & FAQ Guide Modal */}
      <NewJoinerGuideModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateToChat={() => setActiveTab('chat')}
        onNavigateToWorkplace={() => setActiveTab('workplace')}
        onNavigateToDocs={() => setActiveTab('documents')}
      />

      {/* Complete System Architecture & Study Blueprint Modal */}
      <SystemBlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
        onNavigateToTab={(tab) => {
          setIsBlueprintOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
