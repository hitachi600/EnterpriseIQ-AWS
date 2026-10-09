import React, { useState } from 'react';
import { 
  Layers, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Cloud, 
  Zap, 
  FileText, 
  IndianRupee, 
  Calendar, 
  Lock, 
  Users, 
  LifeBuoy, 
  TrendingUp, 
  Check, 
  Building2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FolderOpen
} from 'lucide-react';

interface SystemBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const SystemBlueprintModal: React.FC<SystemBlueprintModalProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'architecture' | 'datamodel' | 'interview'>('modules');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);

  if (!isOpen) return null;

  const MODULES_LIST = [
    {
      id: 'M1',
      name: 'Bedrock RAG Query Engine',
      category: 'Core AI Engine',
      aws: 'Amazon Bedrock (Claude 3.5 Sonnet), OpenSearch Serverless',
      handler: 'backend/handlers/query_handler.py',
      component: 'frontend/src/pages/ChatAssistantPage.tsx',
      dynamoKey: 'PK=USER#<id>, SK=QUERY#<timestamp>',
      role: 'All Authenticated Employees',
      summary: 'Natural language query synthesis with strict prompt grounding, sub-650ms latency, and exact S3 policy citation linking.'
    },
    {
      id: 'M2',
      name: 'Titan Vector Embedding Pipeline',
      category: 'Core AI Engine',
      aws: 'Bedrock Titan Text Embeddings V2, OpenSearch Serverless',
      handler: 'backend/services/bedrock_service.py',
      component: 'frontend/src/pages/UploadDocumentPage.tsx',
      dynamoKey: 'OpenSearch Vector Collection (1024-dim)',
      role: 'All Departments',
      summary: 'Normalizes 1024-dimension vector embeddings using a 512-token chunk sliding window with 10% overlap.'
    },
    {
      id: 'M3',
      name: 'Zero-Trust RBAC Pre-Filtering',
      category: 'Core AI Engine',
      aws: 'Cognito User Pools, Lambda Middleware, OpenSearch Filter',
      handler: 'backend/handlers/lambda_utils.py',
      component: 'frontend/src/components/PersonaSwitcher.tsx',
      dynamoKey: 'Metadata Filter: department IN [UserDept, "All"]',
      role: 'Clearance-Enforced',
      summary: 'Enforces security clearance barriers at the vector search layer, preventing unauthorized document retrieval.'
    },
    {
      id: 'M4',
      name: 'Strict Anti-Hallucination Fallback',
      category: 'Core AI Engine',
      aws: 'OpenSearch Serverless, Lambda Decision Engine',
      handler: 'backend/handlers/query_handler.py',
      component: 'frontend/src/pages/ChatAssistantPage.tsx',
      dynamoKey: 'PK=GAP#<id>, SK=METRIC#<timestamp>',
      role: 'All Employees',
      summary: 'Applies a strict 0.72 cosine similarity threshold; low-confidence queries bypass the LLM and record a Knowledge Gap.'
    },
    {
      id: 'M5',
      name: 'Bedrock Guardrails Adversarial Defense',
      category: 'Security & Governance',
      aws: 'Amazon Bedrock Guardrails, AWS WAF, CloudTrail',
      handler: 'backend/services/guardrails_service.py',
      component: 'frontend/src/pages/ChatAssistantPage.tsx',
      dynamoKey: 'PK=AUDIT#<id>, SK=SECURITY#<timestamp>',
      role: 'Platform Security',
      summary: 'Intercepts prompt injection, system overrides, and exfiltration attacks, immediately emitting CloudWatch P1 audit alerts.'
    },
    {
      id: 'M6',
      name: 'Verified Citation & S3 Linking',
      category: 'Core AI Engine',
      aws: 'Amazon S3 Document Vault, KMS CMK Encryption',
      handler: 'backend/handlers/query_handler.py',
      component: 'frontend/src/components/DocumentPreviewModal.tsx',
      dynamoKey: 'Citation JSON Metadata in API response',
      role: 'All Employees',
      summary: 'Attributes every generated sentence to an official S3 document key, page number, and chunk ID with clickable reader preview.'
    },
    {
      id: 'M7',
      name: 'Polly & Transcribe Voice Assistant',
      category: 'Core AI Engine',
      aws: 'Amazon Polly (Neural Voice), Amazon Transcribe',
      handler: 'Web Audio API / Streaming WebSockets',
      component: 'frontend/src/pages/ChatAssistantPage.tsx',
      dynamoKey: 'Audio Buffer Stream',
      role: 'All Employees',
      summary: 'Enables hands-free voice dictation for submitting workplace queries and high-quality neural voice speech synthesis.'
    },
    {
      id: 'M8',
      name: 'HR PTO & Leave Management Ledger',
      category: 'Workplace Operations',
      aws: 'Amazon DynamoDB, Amazon SQS Email Bridge',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Leave Tab)',
      dynamoKey: 'PK=USER#<id>, SK=LEAVE#<id>, GSI1=DEPT#<dept>',
      role: 'HR & Employees',
      summary: 'Tracks 22 Earned Leave days, 26 weeks paid Maternity leave, and Indian festive holidays with 1-click VP manager approvals.'
    },
    {
      id: 'M9',
      name: 'IT Asset & Serial Number Tracking',
      category: 'Workplace Operations',
      aws: 'Amazon DynamoDB, Okta / Jamf MDM Bridge',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Assets Tab)',
      dynamoKey: 'PK=ASSET#<tag>, SK=DEVICE#<serial>',
      role: 'IT Support & Employee',
      summary: 'Tracks company-issued MacBooks, Dell workstations, and YubiKey 5C MFA serials with FileVault / BitLocker encryption status.'
    },
    {
      id: 'M10',
      name: 'Just-In-Time IAM STS Access Portal',
      category: 'Workplace Operations',
      aws: 'AWS Security Token Service (STS AssumeRole), IAM',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Access Tab)',
      dynamoKey: 'PK=USER#<id>, SK=ACCESS#<reqId>',
      role: 'Security Architect',
      summary: 'Provisions temporary short-lived AWS IAM credentials with automated expiration (1–30 days), eliminating standing admin privileges.'
    },
    {
      id: 'M11',
      name: 'Finance Expense SOP & Per Diems (₹ INR)',
      category: 'Workplace Operations',
      aws: 'Amazon DynamoDB, S3 Receipt Vault, Concur Gateway',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Expenses Tab)',
      dynamoKey: 'PK=USER#<id>, SK=EXPENSE#<claimId>',
      role: 'Finance & All',
      summary: 'Enforces ₹2,500/day meal per diem, ₹2,000 broadband stipend, ₹50,000 WFH setup, and VP approval routing in Indian Rupees.'
    },
    {
      id: 'M12',
      name: 'Digital Policy Cryptographic Acknowledgment',
      category: 'Workplace Operations',
      aws: 'Amazon DynamoDB, SHA-256 Merkle Ledger',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Announcements Tab)',
      dynamoKey: 'PK=ACK#<email>, SK=POLICY#<id>',
      role: 'HR & Compliance',
      summary: 'Records immutable cryptographic SHA-256 digital signatures when employees review updated company policies for SOC 2 audits.'
    },
    {
      id: 'M13',
      name: 'Corporate Announcements & Town Hall Hub',
      category: 'Workplace Operations',
      aws: 'Amazon DynamoDB Broadcast Store, EventBridge',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Announcements Tab)',
      dynamoKey: 'PK=ANN#<id>, SK=PUBLISH#<timestamp>',
      role: 'All Employees',
      summary: 'Broadcasts executive town halls, ₹5 Lakhs AI Innovation Hackathons, and national tech hub announcements with read receipts.'
    },
    {
      id: 'M14',
      name: 'Org Employee Directory & Tech Hubs',
      category: 'Workplace Operations',
      aws: 'Amazon Cognito User Directory, DynamoDB',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/WorkplaceHubPage.tsx (Directory Tab)',
      dynamoKey: 'PK=DIR#<id>, SK=EMP#<empId>',
      role: 'All Employees',
      summary: 'Searchable employee roster across Bengaluru, Hyderabad, Mumbai, Pune, Chennai, Gurugram with contact info and skill tags.'
    },
    {
      id: 'M15',
      name: 'S3 Encrypted Document Vault',
      category: 'Document Lifecycle',
      aws: 'Amazon S3, AWS KMS Customer Managed Keys (CMK)',
      handler: 'backend/handlers/documents_handler.py',
      component: 'frontend/src/pages/DocumentLibraryPage.tsx',
      dynamoKey: 's3://nexora-enterprise-kb-vault-prod/<key>',
      role: 'All Employees',
      summary: 'Encrypted object storage with SSE-KMS, S3 Block Public Access, and 15-minute expiring pre-signed upload URLs.'
    },
    {
      id: 'M16',
      name: 'Dual-Bucket S3 Quarantine Staging',
      category: 'Document Lifecycle',
      aws: 'Amazon S3 Staging Bucket, AWS GuardDuty Malware Scan',
      handler: 'backend/handlers/documents_handler.py',
      component: 'frontend/src/pages/ApprovalsPage.tsx',
      dynamoKey: 's3://nexora-enterprise-staging-quarantine/<key>',
      role: 'Department VPs',
      summary: 'Isolates unreviewed files in a quarantine bucket, preventing unvetted documents from entering the production vector index.'
    },
    {
      id: 'M17',
      name: 'Multi-Department Approvals Workflow',
      category: 'Document Lifecycle',
      aws: 'Amazon DynamoDB, Amazon EventBridge',
      handler: 'backend/handlers/documents_handler.py',
      component: 'frontend/src/pages/ApprovalsPage.tsx',
      dynamoKey: 'PK=APPROVAL#<id>, SK=DOC#<docId>',
      role: 'Senior Managers & VPs',
      summary: 'Human-in-the-loop document versioning and diff review center that triggers automated EventBridge vector indexing upon sign-off.'
    },
    {
      id: 'M18',
      name: 'Asynchronous SQS Vector Ingestion Queue',
      category: 'Document Lifecycle',
      aws: 'Amazon EventBridge, Amazon SQS FIFO, SQS DLQ',
      handler: 'backend/services/bedrock_service.py',
      component: 'backend/services/bedrock_service.py',
      dynamoKey: 'SQS Message Ingestion Pipeline',
      role: 'Serverless Worker',
      summary: 'Decouples document uploads from embedding generation with 3x retry exponential backoff and dead-letter queue routing.'
    },
    {
      id: 'M19',
      name: 'IT Helpdesk SLA Center & AI Escalation',
      category: 'Governance & Telemetry',
      aws: 'Amazon DynamoDB, Jira / ServiceNow Webhook',
      handler: 'backend/handlers/workplace_handler.py',
      component: 'frontend/src/pages/SupportTicketsPage.tsx',
      dynamoKey: 'PK=TICKET#<id>, SK=STATE#<timestamp>',
      role: 'IT Support & Employee',
      summary: 'Converts unresolved queries into structured tickets with grounding context, priority routing (P1–P4), and 2-hour SLA response guarantees.'
    },
    {
      id: 'M20',
      name: 'User Feedback & RAG Quality Loop',
      category: 'Governance & Telemetry',
      aws: 'Amazon DynamoDB, Amazon CloudWatch Alarms',
      handler: 'backend/handlers/feedback_handler.py',
      component: 'frontend/src/pages/FeedbackPage.tsx',
      dynamoKey: 'PK=FEEDBACK#<id>, SK=MSG#<messageId>',
      role: 'Platform Admin',
      summary: 'Collects star ratings and triage comments to identify low-performing vector chunks and trigger automated prompt tuning.'
    },
    {
      id: 'M21',
      name: 'Knowledge Gaps & Query Clustering',
      category: 'Governance & Telemetry',
      aws: 'Bedrock Titan Clustering, DynamoDB',
      handler: 'backend/handlers/admin_handler.py',
      component: 'frontend/src/pages/KnowledgeAnalyticsPage.tsx',
      dynamoKey: 'PK=GAP#<id>, SK=CLUSTER#<dept>',
      role: 'Knowledge Managers',
      summary: 'Clusters ungrounded employee queries to identify missing corporate documentation and prioritize policy drafting.'
    },
    {
      id: 'M22',
      name: 'RAG Triad Automated Evaluation',
      category: 'Governance & Telemetry',
      aws: 'Automated Evaluation Suite, CloudWatch Metrics',
      handler: 'backend/tests/test_rag_pipeline.py',
      component: 'frontend/src/pages/KnowledgeAnalyticsPage.tsx',
      dynamoKey: 'CloudWatch Custom Metrics',
      role: 'QA & DevOps',
      summary: 'Validates Context Relevance (≥0.85), Groundedness (≥0.95), and Answer Relevance (≥0.90) against a verified ground-truth dataset.'
    },
    {
      id: 'M23',
      name: 'Bedrock FinOps Token Cost Attribution (₹)',
      category: 'Governance & Telemetry',
      aws: 'Amazon CloudWatch Metrics, DynamoDB',
      handler: 'backend/handlers/admin_handler.py',
      component: 'frontend/src/pages/KnowledgeAnalyticsPage.tsx (FinOps Tab)',
      dynamoKey: 'PK=FINOPS#<dept>, SK=MONTH#<timestamp>',
      role: 'Finance VP & Admin',
      summary: 'Attributes Foundation Model token spend to Cognito department groups in Indian Rupees (₹0.26 / query; ₹1,248.00 MTD).'
    },
    {
      id: 'M24',
      name: 'Immutable SOC 2 Type II Audit Dossier',
      category: 'Governance & Telemetry',
      aws: 'AWS CloudTrail, DynamoDB Merkle Chain, S3',
      handler: 'backend/handlers/admin_handler.py',
      component: 'frontend/src/pages/AuditLogsPage.tsx',
      dynamoKey: 'Exportable JSON Compliance Package',
      role: 'Compliance Officer',
      summary: '1-Click cryptographic audit dossier export covering SOC 2 Trust Service Criteria CC6.1, CC6.6, CC6.7, and CC7.2.'
    },
    {
      id: 'M25',
      name: 'Live CloudWatch Telemetry & Latency Gauge',
      category: 'Governance & Telemetry',
      aws: 'Amazon CloudWatch Logs & Alarms, AWS X-Ray',
      handler: 'backend/handlers/admin_handler.py',
      component: 'frontend/src/pages/AdminDashboardPage.tsx',
      dynamoKey: 'Real-Time Metric Stream',
      role: 'Cloud DevOps',
      summary: 'Real-time telemetry tracking P50/P95/P99 Bedrock invocation latency, DynamoDB RCU/WCU utilization, and live log streaming.'
    },
    {
      id: 'M26',
      name: 'Cognito Identity & Multi-Persona Switcher',
      category: 'Security & Governance',
      aws: 'Amazon Cognito User Pools, JWT Token Claims',
      handler: 'backend/handlers/lambda_utils.py',
      component: 'frontend/src/components/PersonaSwitcher.tsx',
      dynamoKey: 'Cognito JWT Payload Claims',
      role: 'All Personas',
      summary: 'Simulates 6 organizational roles (Lead Engineer, HR Partner, Finance Analyst, IT Support, Operations Lead, CEO) to verify Zero-Trust RBAC.'
    }
  ];

  const selectedModule = MODULES_LIST[selectedModuleIndex];

  return (
    <div className="modal-backdrop" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div 
        className="modal-container glass-card"
        style={{
          maxWidth: '1040px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 35px rgba(99, 102, 241, 0.3)',
          animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '22px 28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.18) 100%)',
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
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  EnterpriseIQ — Complete System Architecture & Study Blueprint
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>26 Modules Active</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Nexora Technologies India Pvt. Ltd. • AWS ap-south-1 (Mumbai) • Zero-Trust RAG & Operations Suite
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

        {/* Navigation Tabs inside Modal */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'modules' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('modules')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layers size={14} />
            <span>26-Module Deep-Dive Explorer</span>
          </button>

          <button
            className={`btn btn-sm ${activeSubTab === 'architecture' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('architecture')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Cloud size={14} />
            <span>AWS Serverless Topology</span>
          </button>

          <button
            className={`btn btn-sm ${activeSubTab === 'datamodel' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('datamodel')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Database size={14} />
            <span>DynamoDB Single-Table Schema</span>
          </button>

          <button
            className={`btn btn-sm ${activeSubTab === 'interview' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveSubTab('interview')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} />
            <span>Senior Architect Interview Defense</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px 28px' }}>
          
          {/* TAB 1: 26-MODULE DEEP-DIVE EXPLORER */}
          {activeSubTab === 'modules' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '480px' }}>
              {/* Module List Sidebar */}
              <div style={{
                maxHeight: '480px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingRight: '6px'
              }}>
                {MODULES_LIST.map((mod, idx) => {
                  const isSelected = idx === selectedModuleIndex;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => setSelectedModuleIndex(idx)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06b6d4' }}>{mod.id}</span>
                          <strong style={{ fontSize: '0.82rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                            {mod.name}
                          </strong>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {mod.category}
                        </div>
                      </div>
                      <ChevronRight size={14} color={isSelected ? '#818cf8' : 'var(--text-muted)'} />
                    </div>
                  );
                })}
              </div>

              {/* Module Selected Details Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-dept" style={{ fontSize: '0.75rem', fontWeight: 800 }}>{selectedModule.id}</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedModule.name}</h3>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>{selectedModule.category}</span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Production Ready</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedModule.summary}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AWS Cloud Services:</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>{selectedModule.aws}</div>
                  </div>

                  <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security Clearance:</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4ade80', marginTop: '2px' }}>{selectedModule.role}</div>
                  </div>

                  <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Backend Lambda Handler:</div>
                    <code style={{ fontSize: '0.76rem', color: '#a5b4fc', marginTop: '2px', display: 'block' }}>{selectedModule.handler}</code>
                  </div>

                  <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Frontend UI Component:</div>
                    <code style={{ fontSize: '0.76rem', color: '#c084fc', marginTop: '2px', display: 'block' }}>{selectedModule.component}</code>
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#818cf8', textTransform: 'uppercase', fontWeight: 700 }}>DynamoDB Single-Table Key Pattern:</div>
                  <code style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {selectedModule.dynamoKey}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AWS SERVERLESS TOPOLOGY */}
          {activeSubTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Enterprise AWS Cloud Architecture Map (Region: ap-south-1 Mumbai)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The application is architected across 5 core serverless layers: Edge Perimeter (CloudFront + WAF), Identity (Cognito MFA + JWT), Serverless Compute (API Gateway + Lambda), Vector AI (Bedrock + OpenSearch Serverless), and Enterprise Storage (S3 KMS CMK + DynamoDB Single-Table).
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#818cf8' }}>1. Edge & WAF</strong>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>CloudFront CDN with TLS 1.3, AWS WAF OWASP Top 10 rules & IP rate limiting (100 req/sec).</p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#06b6d4' }}>2. Vector Collection</strong>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>OpenSearch Serverless 1024-dim Titan embeddings with HNSW cosine graph indexing.</p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#34d399' }}>3. DynamoDB State</strong>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Single-table on-demand partition housing audit trails, leaves, ₹ claims, and tickets.</p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#fbbf24' }}>4. S3 Dual Vault</strong>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Quarantine staging bucket with GuardDuty malware scan before production vector indexing.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMODB SINGLE-TABLE SCHEMA */}
          {activeSubTab === 'datamodel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                EnterpriseIQ uses a high-performance single-table design with sub-5ms latency and composite partition keys:
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 14px' }}>Entity</th>
                      <th style={{ padding: '10px 14px' }}>Partition Key (PK)</th>
                      <th style={{ padding: '10px 14px' }}>Sort Key (SK)</th>
                      <th style={{ padding: '10px 14px' }}>GSI1PK / GSI1SK</th>
                      <th style={{ padding: '10px 14px' }}>Access Pattern Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { entity: 'Leave Request', pk: 'USER#<empId>', sk: 'LEAVE#<leaveId>', gsi: 'DEPT#<dept> / STATUS#<status>', desc: 'Manager departmental approval queue' },
                      { entity: 'Expense Claim', pk: 'USER#<empId>', sk: 'EXPENSE#<claimId>', gsi: 'STATUS#<status> / DATE#<iso>', desc: 'Finance ₹ reimbursement audit triage' },
                      { entity: 'JIT Access', pk: 'USER#<empId>', sk: 'ACCESS#<reqId>', gsi: 'SYSTEM#<sys> / STATUS#<status>', desc: 'Temporary STS IAM role expiration' },
                      { entity: 'IT Ticket', pk: 'TICKET#<id>', sk: 'STATE#<timestamp>', gsi: 'PRIORITY#<p> / STATUS#<status>', desc: 'IT SLA queue sorted by P1-P4 priority' },
                      { entity: 'Audit Log', pk: 'AUDIT#<id>', sk: 'TIMESTAMP#<iso>', gsi: 'DEPT#<dept> / ACTION#<action>', desc: 'SOC 2 immutable compliance trail' }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.entity}</td>
                        <td style={{ padding: '10px 14px', color: '#a5b4fc', fontFamily: 'monospace' }}>{row.pk}</td>
                        <td style={{ padding: '10px 14px', color: '#c084fc', fontFamily: 'monospace' }}>{row.sk}</td>
                        <td style={{ padding: '10px 14px', color: '#38bdf8', fontFamily: 'monospace' }}>{row.gsi}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SENIOR ARCHITECT INTERVIEW DEFENSE */}
          {activeSubTab === 'interview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '0.88rem', color: '#34d399' }}>🎯 Key Architectural Defenses for Technical Interviews & Client Pitches:</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <details style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    1. Why Zero-Trust Pre-Filtering instead of Post-Filtering?
                  </summary>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    Post-filtering wastes Foundation Model tokens and exposes confidential vectors to intermediate memory buffers. Pre-filtering applies metadata constraints directly in OpenSearch Serverless, mathematically excluding unauthorized vector embeddings from distance computations.
                  </p>
                </details>

                <details style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    2. How does the system achieve ₹0.26 / query cost efficiency?
                  </summary>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    By implementing 512-token chunk sliding windows with top-3 k-nearest neighbor retrieval, we limit the prompt context to ~1,500 tokens. Combined with Claude 3.5 Sonnet token pricing in ap-south-1, this yields an average inference cost of just ₹0.26 per verified query.
                  </p>
                </details>

                <details style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    3. How is Multi-Region High Availability structured?
                  </summary>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Primary region is AWS ap-south-1 (Mumbai) with ap-south-2 (Hyderabad) as hot standby. DynamoDB Global Tables replicate state in &lt;1s, and Route 53 ARC automated DNS failover triggers in 3 minutes if Mumbai error rates exceed 5%.
                  </p>
                </details>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            EnterpriseIQ Architecture Blueprint • 26 Modules Verified • Ready for Enterprise Deployment
          </span>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '7px 20px', fontSize: '0.82rem' }}>
            Close Blueprint Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
