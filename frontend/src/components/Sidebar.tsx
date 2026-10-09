import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { 
  MessageSquare, 
  LayoutDashboard, 
  FolderOpen, 
  UploadCloud, 
  ShieldAlert, 
  Sliders, 
  ThumbsUp, 
  Layers, 
  Key, 
  Sparkles,
  Database,
  Cpu,
  CheckCircle2,
  LifeBuoy,
  BarChart3,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTopology: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenTopology }) => {
  const { currentUser, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);

  useEffect(() => {
    const updateCounts = () => {
      setPendingCount(apiService.getPendingApprovalsCount());
      const tickets = apiService.getTicketsForUser(currentUser);
      setOpenTicketsCount(tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length);
    };
    updateCounts();
    const interval = setInterval(updateCounts, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <aside className="sidebar" id="enterpriseiq-sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo-area">
        <div className="brand-icon-box">
          <Sparkles size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>EnterpriseIQ</span>
            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-light)', fontWeight: 700 }}>AWS RAG</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nexora Technologies</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">AI Knowledge Core</div>
        
        <button
          id="nav-chat"
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={18} />
          <span>AI Assistant</span>
          <span className="nav-badge">RAG</span>
        </button>

        <button
          id="nav-dashboard"
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Executive Dashboard</span>
        </button>

        <button
          id="nav-documents"
          className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FolderOpen size={18} />
          <span>Document Vault</span>
        </button>

        <div className="nav-section-title">Corporate Workflows</div>

        <button
          id="nav-workplace"
          className={`nav-item ${activeTab === 'workplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workplace')}
        >
          <Building2 size={18} color="#818cf8" />
          <span>Workplace Operations</span>
          <span className="badge badge-dept" style={{ fontSize: '0.62rem', padding: '1px 5px', marginLeft: 'auto' }}>HRMS</span>
        </button>

        <button
          id="nav-approvals"
          className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <CheckCircle2 size={18} color="#eab308" />
          <span>Approval Queue</span>
          {pendingCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              padding: '2px 7px',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.25)',
              color: '#fbbf24',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          id="nav-tickets"
          className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <LifeBuoy size={18} color="#06b6d4" />
          <span>IT Helpdesk & Tickets</span>
          {openTicketsCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              padding: '2px 7px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.25)',
              color: '#22d3ee',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          id="nav-analytics"
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} color="#c084fc" />
          <span>Gaps & AI Evaluation</span>
        </button>

        <button
          id="nav-upload"
          className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <UploadCloud size={18} />
          <span>Upload & Ingest</span>
        </button>

        <div className="nav-section-title">Governance & Administration</div>

        <button
          id="nav-admin"
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <Sliders size={18} />
          <span>Admin Center</span>
          {isAdmin && <span className="badge badge-dept" style={{ fontSize: '0.65rem', padding: '2px 5px' }}>Full</span>}
        </button>

        <button
          id="nav-audit"
          className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <ShieldAlert size={18} />
          <span>Security Audit Logs</span>
        </button>

        <button
          id="nav-feedback"
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <ThumbsUp size={18} />
          <span>Feedback & Quality</span>
        </button>

        <div className="nav-section-title">Cloud Infrastructure</div>

        <button
          id="nav-topology"
          className={`nav-item ${activeTab === 'topology' ? 'active' : ''}`}
          onClick={() => setActiveTab('topology')}
        >
          <Layers size={18} />
          <span>AWS Architecture</span>
        </button>

        <button
          id="nav-settings"
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Key size={18} />
          <span>Cognito & IAM Auth</span>
        </button>
      </nav>

      {/* Footer Info Box */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Database size={14} color="#06b6d4" />
          <span>Vector Index: </span>
          <strong style={{ color: 'var(--accent-cyan)' }}>OpenSearch Sls</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <Cpu size={14} color="#a855f7" />
          <span>Foundation Model: </span>
          <span>Claude 3.5</span>
        </div>
      </div>
    </aside>
  );
};
