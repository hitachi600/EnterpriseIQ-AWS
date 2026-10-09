import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  Laptop, 
  Calendar, 
  IndianRupee, 
  Users, 
  LifeBuoy, 
  FileCheck,
  ArrowRight,
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';

interface NewJoinerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat?: () => void;
  onNavigateToWorkplace?: () => void;
  onNavigateToDocs?: () => void;
}

export const NewJoinerGuideModal: React.FC<NewJoinerGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToChat,
  onNavigateToWorkplace,
  onNavigateToDocs
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div 
        className="modal-container glass-card"
        style={{
          maxWidth: '820px',
          width: '94%',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '0',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(99, 102, 241, 0.25)',
          animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  New Joiner & Fresher Orientation Guide
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>2026 Edition</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Welcome to Nexora Technologies! Here is everything you need to know to navigate EnterpriseIQ effortlessly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. First Week Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your 5-Step First Week Checklist
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Laptop size={16} color="#38bdf8" />
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>1. Hardware & VPN Setup</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Connect to GlobalProtect VPN at <code style={{ color: '#a5b4fc' }}>vpn-mumbai.nexora.co.in</code>. Insert YubiKey 5C and hold capacitive sensor for 3 seconds.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <IndianRupee size={16} color="#34d399" />
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>2. Claim ₹50,000 WFH Stipend</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Submit ergonomic home office setup receipts (₹50,000 one-time allowance) via the Workplace Hub expense claims tab within your first 30 days.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Calendar size={16} color="#ec4899" />
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>3. Understand Leave & PTO</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  You accrue <strong>22 Earned Leave (EL/PTO) days</strong> per year + 26 weeks paid Maternity leave + 4 weeks Paternity leave.
                </p>
              </div>

              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FileCheck size={16} color="#a855f7" />
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>4. Sign Compliance Policies</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Review and digitally sign company policies (NEX-HR-POL-001) in the Announcements tab to record your SHA-256 compliance timestamp.
                </p>
              </div>

            </div>
          </div>

          {/* 2. How to Use EnterpriseIQ Features */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Zap size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Platform Feature Quickstart
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} /> 1. Amazon Bedrock AI Assistant
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Ask questions in natural language. Bedrock retrieves verified documents from S3 and provides answers with exact citations.
                  </div>
                </div>
                {onNavigateToChat && (
                  <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => { onClose(); onNavigateToChat(); }}>
                    Try AI Chat →
                  </button>
                )}
              </div>

              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} /> 2. Workplace Operations Suite
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Manage your PTO leave requests, IT hardware assets, temporary AWS IAM access, travel expense claims, and view the team directory.
                  </div>
                </div>
                {onNavigateToWorkplace && (
                  <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => { onClose(); onNavigateToWorkplace(); }}>
                    Open Workplace Hub →
                  </button>
                )}
              </div>

              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} /> 3. Persona Switcher (Testing & Demo)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Use the quick switcher bar at the top of the screen to switch between HR, Engineering, Finance, IT Support, Operations, and Management personas to see how Zero-Trust RBAC restricts data access.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Common Fresher Questions (FAQ) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <HelpCircle size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Frequently Asked Questions for Freshers
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <details style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <summary style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  How does the hybrid schedule and core hours work?
                </summary>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                  Employees are expected in their designated Indian tech hub 2 days per week (typically Tuesdays & Thursdays). Synchronous core hours on Slack are <strong>09:30 AM to 06:30 PM IST</strong>.
                </div>
              </details>

              <details style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <summary style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  What is the meal per diem limit for travel?
                </summary>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                  Domestic travel across Tier-1 Indian Metros allows up to <strong>₹2,500.00/day</strong> (₹500 Breakfast, ₹800 Lunch, ₹1,200 Dinner). Metro lodging cap is <strong>₹7,500.00 to ₹12,000.00/night</strong>.
                </div>
              </details>

              <details style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <summary style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  What if I cannot find an answer or have an urgent IT problem?
                </summary>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                  Use the <strong>"Escalate Ticket"</strong> button in the AI chat or visit the IT Helpdesk tab. Critical P1 tickets have a 2-hour SLA response guarantee.
                </div>
              </details>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Nexora Technologies • Workplace & Knowledge Management Platform
          </span>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '7px 18px', fontSize: '0.82rem' }}>
            Got it, Let's Get Started!
          </button>
        </div>
      </div>
    </div>
  );
};
