import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { DocumentItem, AdminMetrics } from '../types';
import { 
  Sparkles, 
  MessageSquare,
  FileText, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  FolderOpen, 
  CheckCircle, 
  TrendingUp, 
  Lock, 
  Search, 
  BookOpen,
  Laptop,
  Calendar,
  IndianRupee,
  Users,
  LifeBuoy,
  Building2,
  CheckCircle2,
  ChevronRight,
  Megaphone,
  Check
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToChat: () => void;
  onNavigateToDocs: () => void;
  onNavigateToWorkplace?: () => void;
  onNavigateToTickets?: () => void;
  onNavigateToApprovals?: () => void;
  onNavigateToAnalytics?: () => void;
  onOpenOnboarding?: () => void;
  onViewDoc: (docId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigateToChat, 
  onNavigateToDocs, 
  onNavigateToWorkplace,
  onNavigateToTickets,
  onNavigateToApprovals,
  onNavigateToAnalytics,
  onOpenOnboarding,
  onViewDoc 
}) => {
  const { currentUser } = useAuth();
  const [userDocs, setUserDocs] = useState<DocumentItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>(apiService.getAdminMetrics());
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchDocs = async () => {
      const docs = await apiService.getDocuments(currentUser);
      setUserDocs(docs);
    };
    fetchDocs();
  }, [currentUser]);

  const getClearanceBadge = (level: string) => {
    switch (level) {
      case 'RESTRICTED': return <span className="badge badge-restricted">RESTRICTED</span>;
      case 'CONFIDENTIAL': return <span className="badge badge-confidential">CONFIDENTIAL</span>;
      case 'DEPARTMENT_ONLY': return <span className="badge badge-dept">DEPARTMENT ONLY</span>;
      default: return <span className="badge badge-public">PUBLIC INTERNAL</span>;
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToChat();
  };

  return (
    <div className="page-container" id="dashboard-page" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* 1. Hero Welcome & Profile Banner */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.10) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ 
                  width: '68px', 
                  height: '68px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '3px solid #6366f1',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--bg-app)'
              }} title="Cognito SSO Active" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span className="badge badge-dept" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  {currentUser.department}
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle size={11} /> AWS ap-south-1
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Emp ID: {currentUser.employeeId}</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome back, {currentUser.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '3px', maxWidth: '620px' }}>
                EnterpriseIQ connects you to verified Indian corporate knowledge, HRMS operations, and AWS serverless workflows.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onOpenOnboarding && (
              <button 
                id="btn-dash-new-joiner"
                className="btn btn-primary" 
                onClick={onOpenOnboarding}
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  fontSize: '0.84rem'
                }}
              >
                <BookOpen size={15} />
                <span>New Joiner Guide</span>
              </button>
            )}

            <button 
              id="btn-dash-ask-ai"
              className="btn btn-secondary" 
              onClick={onNavigateToChat}
              style={{ fontSize: '0.84rem' }}
            >
              <Sparkles size={15} color="#06b6d4" />
              <span>Ask Bedrock AI</span>
            </button>

            {onNavigateToWorkplace && (
              <button 
                id="btn-dash-workplace-hub"
                className="btn btn-outline" 
                onClick={onNavigateToWorkplace}
                style={{ fontSize: '0.84rem' }}
              >
                <Building2 size={15} color="#818cf8" />
                <span>Workplace Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Instant AI Assistant Launcher Bar */}
      <div 
        className="glass-card"
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          background: 'rgba(15, 23, 42, 0.65)'
        }}
      >
        <form onSubmit={handleQuickSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              className="input-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask anything (e.g. ₹50,000 WFH setup, 22 days PTO policy, VPN Error 504, travel meal per diem)..."
              style={{
                width: '100%',
                paddingLeft: '44px',
                paddingRight: '16px',
                height: '46px',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>
          <button 
            type="submit"
            className="btn btn-primary"
            style={{ 
              height: '46px', 
              padding: '0 22px', 
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0
            }}
          >
            <Sparkles size={16} />
            <span>Ask AI</span>
          </button>
        </form>

        {/* Quick Prompt Pill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Prompts:</span>
          {[
            { label: '💻 ₹50,000 WFH Setup', query: 'How do I claim our ₹50,000 WFH setup reimbursement?' },
            { label: '🏖️ 22 Days Leave Policy', query: 'How does annual leave PTO and parental leave work?' },
            { label: '💳 ₹2,500 Meal Per Diem', query: 'What is our domestic travel meal per diem and hotel limit?' },
            { label: '🔐 VPN Error 504 & YubiKey', query: 'How do I resolve VPN error 504 and use YubiKey MFA?' },
            { label: '🚀 K8s Canary Runbook', query: 'What are our Kubernetes canary deployment steps?' }
          ].map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={onNavigateToChat}
              className="btn btn-ghost"
              style={{
                fontSize: '0.74rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Quick Access Hub (6 Clean Primary Cards) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#6366f1" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Workplace Quick Access Hub
            </h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>1-Click Fast Actions for Employees</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          
          {/* Card 1: AI Assistant */}
          <div 
            id="card-quick-ai"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onNavigateToChat}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.18)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} />
              </div>
              <span className="badge badge-dept" style={{ fontSize: '0.68rem' }}>RAG Engine</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>AI Knowledge Assistant</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Ask natural language queries grounded in verified S3 policies with source citations.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
              <span>Launch Chat</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Workplace Hub (Leave & PTO) */}
          <div 
            id="card-quick-leave"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onNavigateToWorkplace}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>22 Days Left</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Leave & PTO Portal</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Apply for earned leave, view holiday calendars (Diwali, Pongal), and manage balances.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
              <span>Apply for Leave</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: Expense Claims (₹ INR) */}
          <div 
            id="card-quick-expense"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onNavigateToWorkplace}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={20} />
              </div>
              <span className="badge badge-warn" style={{ fontSize: '0.68rem' }}>₹ INR Claims</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Expense Reimbursements</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Submit ₹2,500/day meal per diem, ₹2,000 broadband, or ₹50,000 WFH setup receipts.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
              <span>Submit Claim</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 4: Document Vault */}
          <div 
            id="card-quick-docs"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onNavigateToDocs}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.18)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderOpen size={20} />
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{userDocs.length} Verified</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Verified Document Vault</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Browse official engineering runbooks, HR benefits, and security governance SOPs.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#22d3ee', fontWeight: 600 }}>
              <span>Browse Vault</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 5: IT Helpdesk */}
          <div 
            id="card-quick-helpdesk"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onNavigateToTickets || onNavigateToWorkplace}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.18)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LifeBuoy size={20} />
              </div>
              <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', fontSize: '0.68rem' }}>2h SLA</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>IT Support Helpdesk</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Resolve VPN timeouts, request IAM roles, or report hardware issues with SLA tracking.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#f472b6', fontWeight: 600 }}>
              <span>Open Helpdesk</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 6: Onboarding Guide */}
          <div 
            id="card-quick-onboarding"
            className="glass-card"
            style={{ 
              padding: '18px', 
              cursor: 'pointer', 
              transition: 'var(--transition)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onClick={onOpenOnboarding}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.18)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.68rem' }}>Freshers</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>New Joiner Guide</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                5-step first week checklist, YubiKey VPN guide, stipend policies, and FAQ answers.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
              <span>View Handbook</span>
              <ChevronRight size={14} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Live Corporate Announcement Banner */}
      <div 
        className="glass-card"
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'rgba(245, 158, 11, 0.2)', 
            color: '#fbbf24', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Megaphone size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                🚀 Q4 2026 Town Hall & Enterprise AI Hackathon (India Hubs)
              </strong>
              <span className="badge badge-warn" style={{ fontSize: '0.66rem' }}>Prize Pool: ₹5 Lakhs</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Live broadcast with CEO Vikram Malhotra on Oct 28th across Bengaluru, Hyderabad & Pune centers.
            </div>
          </div>
        </div>

        {onNavigateToWorkplace && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onNavigateToWorkplace}
            style={{ fontSize: '0.78rem' }}
          >
            <span>View Announcements</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* 5. Stats Grid (4 Clean Minimalist Cards) */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FileText size={22} />
          </div>
          <span className="stat-val">{userDocs.length}</span>
          <span className="stat-label">Authorized Policies ({currentUser.department})</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Sparkles size={22} />
          </div>
          <span className="stat-val">{metrics.totalQueriesToday}</span>
          <span className="stat-label">Enterprise Queries Today</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Zap size={22} />
          </div>
          <span className="stat-val">{metrics.avgRagLatencyMs}ms</span>
          <span className="stat-label">Avg Bedrock Retrieval Latency</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <ShieldCheck size={22} />
          </div>
          <span className="stat-val">100%</span>
          <span className="stat-label">RBAC Vector Pre-filter Rate</span>
        </div>
      </div>

      {/* 6. Two Column Section (Recent Docs & Security Clearance) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Left: Recent Authorized Documents */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Authorized Department Documents</h3>
            </div>
            <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={onNavigateToDocs}>
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userDocs.slice(0, 4).map((doc) => (
              <div 
                key={doc.id}
                onClick={() => onViewDoc(doc.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={16} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {doc.fileName} • {doc.fileSize}
                    </div>
                  </div>
                </div>
                <div>
                  {getClearanceBadge(doc.classification)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security Clearance Profile */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Lock size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Cognito RBAC Security Profile</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Employee ID & Email:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {currentUser.employeeId} ({currentUser.email})
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Cognito User Pool Groups:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {currentUser.cognitoGroups.map((g, idx) => (
                  <span key={idx} className="badge badge-dept" style={{ fontSize: '0.74rem' }}>{g}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Permitted Document Classifications:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {currentUser.clearanceLevel.map((c, idx) => (
                  <span key={idx}>{getClearanceBadge(c)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
