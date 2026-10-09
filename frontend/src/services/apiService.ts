import { 
  User, 
  DocumentItem, 
  ChatMessage, 
  Citation, 
  FeedbackRecord, 
  AuditLog, 
  AdminMetrics, 
  SystemHealthStatus, 
  Classification, 
  Department,
  DocumentApproval,
  SupportTicket,
  KnowledgeGap,
  AiEvaluationResult,
  LeaveRequest,
  PtoBalance,
  ItAsset,
  AccessRequest,
  ExpenseClaim,
  CorporateAnnouncement,
  PolicyAcknowledgment,
  OrgEmployee
} from '../types';
import { 
  DEMO_DOCUMENTS, 
  DEMO_USERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_FEEDBACK_RECORDS, 
  INITIAL_ADMIN_METRICS, 
  SYSTEM_HEALTH_DATA,
  INITIAL_APPROVALS,
  INITIAL_TICKETS,
  INITIAL_KNOWLEDGE_GAPS,
  INITIAL_AI_EVALUATIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PTO_BALANCES,
  INITIAL_IT_ASSETS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_EXPENSE_CLAIMS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLICY_ACKNOWLEDGMENTS,
  INITIAL_ORG_DIRECTORY
} from '../mock/mockData';

// Local storage keys for state persistence in browser demo
const STORAGE_KEYS = {
  DOCUMENTS: 'enterpriseiq_docs_v2_catalog',
  AUDIT_LOGS: 'enterpriseiq_audit_v2',
  FEEDBACK: 'enterpriseiq_feedback_v2',
  METRICS: 'enterpriseiq_metrics_v2',
  CONFIG: 'enterpriseiq_config_v2',
  APPROVALS: 'enterpriseiq_approvals_v2',
  TICKETS: 'enterpriseiq_tickets_v2',
  GAPS: 'enterpriseiq_gaps_v2',
  EVALUATIONS: 'enterpriseiq_evaluations_v2',
  LEAVES: 'enterpriseiq_leaves_v2',
  PTO: 'enterpriseiq_pto_v2',
  ASSETS: 'enterpriseiq_assets_v2',
  ACCESS_REQ: 'enterpriseiq_access_v2',
  EXPENSES: 'enterpriseiq_expenses_v2',
  ANNOUNCEMENTS: 'enterpriseiq_announcements_v2',
  POLICY_ACKS: 'enterpriseiq_policy_acks_v2',
  ORG_DIR: 'enterpriseiq_org_v2'
};

class EnterpriseApiService {
  private documents: DocumentItem[] = [];
  private auditLogs: AuditLog[] = [];
  private feedbackRecords: FeedbackRecord[] = [];
  private approvals: DocumentApproval[] = [];
  private tickets: SupportTicket[] = [];
  private knowledgeGaps: KnowledgeGap[] = [];
  private aiEvaluations: AiEvaluationResult[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private ptoBalances: Record<string, PtoBalance> = INITIAL_PTO_BALANCES;
  private itAssets: ItAsset[] = [];
  private accessRequests: AccessRequest[] = [];
  private expenseClaims: ExpenseClaim[] = [];
  private announcements: CorporateAnnouncement[] = [];
  private policyAcks: PolicyAcknowledgment[] = [];
  private orgDirectory: OrgEmployee[] = [];
  private metrics: AdminMetrics = INITIAL_ADMIN_METRICS;
  private isLiveAwsMode: boolean = false;
  private apiGatewayBaseUrl: string = '';


  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (savedDocs) {
        const parsed: DocumentItem[] = JSON.parse(savedDocs);
        const docMap = new Map<string, DocumentItem>();
        DEMO_DOCUMENTS.forEach(d => docMap.set(d.id, d));
        parsed.forEach(d => docMap.set(d.id, d));
        this.documents = Array.from(docMap.values());
      } else {
        this.documents = [...DEMO_DOCUMENTS];
      }

      const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedAudit ? JSON.parse(savedAudit) : [...INITIAL_AUDIT_LOGS];

      const savedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      this.feedbackRecords = savedFeedback ? JSON.parse(savedFeedback) : [...INITIAL_FEEDBACK_RECORDS];

      const savedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      this.approvals = savedApprovals ? JSON.parse(savedApprovals) : [...INITIAL_APPROVALS];

      const savedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      this.tickets = savedTickets ? JSON.parse(savedTickets) : [...INITIAL_TICKETS];

      const savedGaps = localStorage.getItem(STORAGE_KEYS.GAPS);
      this.knowledgeGaps = savedGaps ? JSON.parse(savedGaps) : [...INITIAL_KNOWLEDGE_GAPS];

      const savedLeaves = localStorage.getItem(STORAGE_KEYS.LEAVES);
      this.leaveRequests = savedLeaves ? JSON.parse(savedLeaves) : [...INITIAL_LEAVE_REQUESTS];

      const savedPto = localStorage.getItem(STORAGE_KEYS.PTO);
      this.ptoBalances = savedPto ? JSON.parse(savedPto) : { ...INITIAL_PTO_BALANCES };

      const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
      this.itAssets = savedAssets ? JSON.parse(savedAssets) : [...INITIAL_IT_ASSETS];

      const savedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_REQ);
      this.accessRequests = savedAccess ? JSON.parse(savedAccess) : [...INITIAL_ACCESS_REQUESTS];

      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      this.expenseClaims = savedExpenses ? JSON.parse(savedExpenses) : [...INITIAL_EXPENSE_CLAIMS];

      const savedAnnounce = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      this.announcements = savedAnnounce ? JSON.parse(savedAnnounce) : [...INITIAL_ANNOUNCEMENTS];

      const savedAcks = localStorage.getItem(STORAGE_KEYS.POLICY_ACKS);
      this.policyAcks = savedAcks ? JSON.parse(savedAcks) : [...INITIAL_POLICY_ACKNOWLEDGMENTS];

      const savedOrg = localStorage.getItem(STORAGE_KEYS.ORG_DIR);
      this.orgDirectory = savedOrg ? JSON.parse(savedOrg) : [...INITIAL_ORG_DIRECTORY];

      const savedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
      this.metrics = savedMetrics ? JSON.parse(savedMetrics) : { ...INITIAL_ADMIN_METRICS };

      // Update dynamic counts
      this.metrics.pendingApprovalsCount = this.approvals.filter(a => a.status === 'PENDING').length;
      this.metrics.openTicketsCount = this.tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      this.metrics.pendingLeavesCount = this.leaveRequests.filter(l => l.status === 'PENDING').length;
      this.metrics.pendingExpensesCount = this.expenseClaims.filter(e => e.status === 'SUBMITTED').length;

      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.isLiveAwsMode = config.isLiveAwsMode || false;
        this.apiGatewayBaseUrl = config.apiGatewayBaseUrl || '';
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
      this.documents = [...DEMO_DOCUMENTS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.feedbackRecords = [...INITIAL_FEEDBACK_RECORDS];
      this.approvals = [...INITIAL_APPROVALS];
      this.tickets = [...INITIAL_TICKETS];
      this.knowledgeGaps = [...INITIAL_KNOWLEDGE_GAPS];
      this.aiEvaluations = [...INITIAL_AI_EVALUATIONS];
      this.leaveRequests = [...INITIAL_LEAVE_REQUESTS];
      this.ptoBalances = { ...INITIAL_PTO_BALANCES };
      this.itAssets = [...INITIAL_IT_ASSETS];
      this.accessRequests = [...INITIAL_ACCESS_REQUESTS];
      this.expenseClaims = [...INITIAL_EXPENSE_CLAIMS];
      this.announcements = [...INITIAL_ANNOUNCEMENTS];
      this.policyAcks = [...INITIAL_POLICY_ACKNOWLEDGMENTS];
      this.orgDirectory = [...INITIAL_ORG_DIRECTORY];
      this.metrics = { ...INITIAL_ADMIN_METRICS };
    }
  }

  private saveState() {
    try {
      this.metrics.pendingApprovalsCount = this.approvals.filter(a => a.status === 'PENDING').length;
      this.metrics.openTicketsCount = this.tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      this.metrics.pendingLeavesCount = this.leaveRequests.filter(l => l.status === 'PENDING').length;
      this.metrics.pendingExpensesCount = this.expenseClaims.filter(e => e.status === 'SUBMITTED').length;

      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(this.feedbackRecords));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(this.approvals));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(this.tickets));
      localStorage.setItem(STORAGE_KEYS.GAPS, JSON.stringify(this.knowledgeGaps));
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(this.aiEvaluations));
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(this.leaveRequests));
      localStorage.setItem(STORAGE_KEYS.PTO, JSON.stringify(this.ptoBalances));
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(this.itAssets));
      localStorage.setItem(STORAGE_KEYS.ACCESS_REQ, JSON.stringify(this.accessRequests));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenseClaims));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements));
      localStorage.setItem(STORAGE_KEYS.POLICY_ACKS, JSON.stringify(this.policyAcks));
      localStorage.setItem(STORAGE_KEYS.ORG_DIR, JSON.stringify(this.orgDirectory));
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(this.metrics));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
        isLiveAwsMode: this.isLiveAwsMode,
        apiGatewayBaseUrl: this.apiGatewayBaseUrl
      }));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  public getConfiguration() {
    return {
      isLiveAwsMode: this.isLiveAwsMode,
      apiGatewayBaseUrl: this.apiGatewayBaseUrl
    };
  }

  public setConfiguration(config: { isLiveAwsMode: boolean; apiGatewayBaseUrl: string }) {
    this.isLiveAwsMode = config.isLiveAwsMode;
    this.apiGatewayBaseUrl = config.apiGatewayBaseUrl;
    this.saveState();
  }

  // Check if a document is accessible by the user based on RBAC rules
  public canAccessDocument(user: User, doc: DocumentItem): boolean {
    if (user.role === 'Admin' || user.department === 'All Departments') {
      return true;
    }
    if (doc.classification === 'PUBLIC_INTERNAL') {
      return true;
    }
    if (doc.department === user.department) {
      if (doc.classification === 'DEPARTMENT_ONLY') return true;
      if (doc.classification === 'CONFIDENTIAL' && user.clearanceLevel.includes('CONFIDENTIAL')) return true;
      if (doc.classification === 'RESTRICTED' && user.clearanceLevel.includes('RESTRICTED')) return true;
    }
    if (user.department === 'Management') {
      return true;
    }
    return false;
  }

  // Get documents filtered by user's authorization
  public async getDocuments(user: User): Promise<DocumentItem[]> {
    if (this.isLiveAwsMode && this.apiGatewayBaseUrl) {
      // Connects to AWS API Gateway /api/v1/documents
      try {
        const res = await fetch(`${this.apiGatewayBaseUrl}/documents`, {
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'x-department': user.department
          }
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Live API Gateway error, falling back to local vault:', err);
      }
    }

    // Filter documents strictly by RBAC clearance
    return this.documents.filter(doc => this.canAccessDocument(user, doc));
  }

  public getAllDocumentsForAdmin(): DocumentItem[] {
    return [...this.documents];
  }

  // Simulate RAG Bedrock Query Pipeline
  public async queryBedrockRag(
    user: User,
    question: string,
    onTokenChunk?: (token: string) => void
  ): Promise<ChatMessage> {
    const startTime = Date.now();
    const cleanQuery = question.trim().toLowerCase();

    // 1. Guardrail / Prompt Injection Check
    const injectionPatterns = [
      'ignore previous instructions',
      'ignore all rules',
      'system prompt',
      'reveal confidential',
      'jailbreak',
      'bypass authorization',
      'drop database',
      'override security'
    ];

    const isInjection = injectionPatterns.some(p => cleanQuery.includes(p));

    if (isInjection) {
      const blockedLog: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: user.email,
        department: user.department,
        action: 'PROMPT_INJECTION_DEFENSE',
        resource: 'Amazon Bedrock Guardrail (nexora-injection-defense-v1)',
        status: 'FLAGGED',
        details: `Blocked adversarial prompt injection pattern in query: "${question.substring(0, 60)}..."`,
        ipAddress: '10.0.8.21',
        awsService: 'WAF'
      };
      this.auditLogs.unshift(blockedLog);
      this.saveState();

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Security Alert - Amazon Bedrock Guardrail Triggered**\n\nYour query contains input patterns that violate Nexora AI Security Policies (adversarial instruction / prompt override attempt). This incident has been logged to CloudWatch and CloudTrail security audit logs.\n\n*Reference ID: SEC-GUARD-${Date.now().toString().slice(-6)}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityStatus: 'BLOCKED_INJECTION',
        latencyMs: 180,
        tokensUsed: { prompt: 45, completion: 40, total: 85 }
      };
    }

    // 2. Department-Enforced RAG Retrieval
    // Identify accessible documents for this user
    const accessibleDocs = this.documents.filter(doc => this.canAccessDocument(user, doc));

    // Check if user is asking for restricted content they lack clearance for
    const asksAboutRestrictedCompensation = 
      cleanQuery.includes('bonus') || 
      cleanQuery.includes('executive compensation') || 
      cleanQuery.includes('salary matrix') || 
      cleanQuery.includes('equity vesting');

    if (asksAboutRestrictedCompensation && !user.clearanceLevel.includes('RESTRICTED') && user.department !== 'Finance' && user.department !== 'Management' && user.role !== 'Admin') {
      const deniedLog: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: user.email,
        department: user.department,
        action: 'ACCESS_DENIED_BLOCKED',
        resource: 'S3:nexora-enterprise-kb-vault-prod/finance/confidential/NEX-FIN-PAY-002',
        status: 'DENIED',
        details: `User with clearance [${user.clearanceLevel.join(', ')}] attempted to retrieve [RESTRICTED] executive payroll documentation.`,
        ipAddress: '10.0.14.77',
        awsService: 'Lambda'
      };
      this.auditLogs.unshift(deniedLog);
      this.saveState();

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `⛔ **Access Denied - Department Clearance Required**\n\nYou are authenticated as **${user.name}** (${user.department}). The information requested is classified as **RESTRICTED (Finance & Executive Leadership Only)**.\n\nUnder Nexora Zero-Trust RBAC policies, vector retrieval pre-filters confidential document chunks at the backend layer. Your request has been safely blocked and recorded.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityStatus: 'ACCESS_DENIED',
        latencyMs: 240,
        tokensUsed: { prompt: 62, completion: 58, total: 120 }
      };
    }

    // 3. Document Chunk Matching & Retrieval
    let matchedDoc: DocumentItem | null = null;
    let relevantSnippet = '';
    let citations: Citation[] = [];
    let responseText = '';
    let relevanceScore = 0.96;

    // Out-of-domain & Fictitious Topic Guard (Strict Anti-Hallucination)
    const isOutOfDomain = 
      cleanQuery.includes('interplanetary') ||
      cleanQuery.includes('lunar') ||
      cleanQuery.includes('moon') ||
      cleanQuery.includes('mars') ||
      cleanQuery.includes('alien') ||
      cleanQuery.includes('telepathy') ||
      cleanQuery.includes('flying car') ||
      cleanQuery.includes('time machine') ||
      cleanQuery.includes('crypto casino') ||
      cleanQuery.includes('spacecraft') ||
      cleanQuery.includes('superpower') ||
      cleanQuery.includes('holodeck');

    if (!isOutOfDomain) {
      if (cleanQuery.includes('work from home') || cleanQuery.includes('remote') || cleanQuery.includes('hybrid') || cleanQuery.includes('broadband') || cleanQuery.includes('stipend')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-hr-001') || null;
        if (matchedDoc) {
          relevanceScore = 0.97;
          relevantSnippet = 'Hybrid employees expected in office 2 days/week. Core hours: 09:30 AM - 06:30 PM IST. ₹50,000 setup reimbursement, ₹2,000/mo broadband subsidy, ₹25,000 annual equipment refresh.';
          responseText = `Based on **Nexora Technologies India Remote Work & Hybrid Schedule Policy (NEX-HR-POL-001)**:

• **Hybrid Schedule:** Employees are expected in their designated Indian tech hub (Bengaluru, Hyderabad, Mumbai, Pune, Chennai, Gurugram) **2 days per week** (typically Tuesdays and Thursdays). Fully remote arrangements require approval from your Department VP and HR People Partner.
• **Core Hours:** All team members must be available for synchronous collaboration on Slack between **09:30 AM and 06:30 PM IST**.
• **Stipends & Allowances:**
  - **₹50,000** one-time ergonomic home office setup reimbursement upon hire.
  - **₹2,000/month** recurring broadband and fiber internet subsidy credited directly in monthly payroll.
  - **₹25,000/year** annual hardware and peripheral refresh allowance via the Finance Concur portal.`;
        }
      } else if (cleanQuery.includes('health') || cleanQuery.includes('insurance') || cleanQuery.includes('medical') || cleanQuery.includes('wellness') || cleanQuery.includes('epf') || cleanQuery.includes('gratuity') || cleanQuery.includes('opd')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-hr-002') || null;
        if (matchedDoc) {
          relevanceScore = 0.96;
          relevantSnippet = '₹10,00,000 Family Floater Group Medical Insurance. Cashless hospitalization across 8,000+ hospitals. ₹15,000 annual OPD dental/vision. 12% EPF matching.';
          responseText = `According to the **Nexora Comprehensive Healthcare & Wellness Benefits Guide (NEX-HR-BEN-002)**:

• **Group Medical Insurance:** **₹10,00,000 Family Floater** policy covering employee, spouse, up to 2 children, and dependent parents with cashless coverage across 8,000+ network hospitals.
• **OPD & Wellness:** **₹15,000/year** outpatient, dental, and optical reimbursement allowance.
• **Retirement Benefits:** Nexora matches **12% Employer Provident Fund (EPF)** contribution, with statutory gratuity per Payment of Gratuity Act 1972.
• **Mental Health Support:** Unlimited 24/7 confidential counseling through 1to1Help.`;
        }
      } else if (cleanQuery.includes('reimburse') || cleanQuery.includes('concur') || cleanQuery.includes('per diem') || (cleanQuery.includes('expense') && !cleanQuery.includes('bonus')) || (cleanQuery.includes('travel') && (cleanQuery.includes('expense') || cleanQuery.includes('allowance') || cleanQuery.includes('hotel') || cleanQuery.includes('flight') || cleanQuery.includes('lodging') || cleanQuery.includes('sop') || cleanQuery.includes('policy') || cleanQuery.includes('meal')))) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-fin-001') || null;
        if (matchedDoc) {
          relevanceScore = 0.98;
          relevantSnippet = 'SAP Concur within 30 days. Domestic Per Diem ₹2,500/day (₹500 breakfast, ₹800 lunch, ₹1,200 dinner). Tier-1 Metro Hotel limit ₹7,500 to ₹12,000/night.';
          responseText = `According to the **Nexora Technologies India Travel & Expense Reimbursement SOP (NEX-FIN-EXP-001)**:

1. **Submission Window:** GST tax-compliant tax invoices must be submitted through **SAP Concur within 30 calendar days** of the expense date.
2. **Meal Per Diems:**
   - **Domestic (Tier-1 Indian Metros):** **₹2,500.00/day** (₹500 Breakfast, ₹800 Lunch, ₹1,200 Dinner).
   - **International Travel:** Converted SBI TT reference rates with prior Finance Director sign-off.
3. **Lodging Guidelines:** Standard metro hotel cap is **₹7,500.00 - ₹12,000.00/night** across major tech hubs (Bengaluru, Mumbai BKC, NCR Gurugram, Hyderabad Hitec City).
4. **Disbursement:** NEFT/RTGS direct deposit reimbursement runs on the **15th and last business day** of each month.`;
        }
      } else if (cleanQuery.includes('procurement') || cleanQuery.includes('vendor') || cleanQuery.includes('purchase order') || cleanQuery.includes('invoice') || cleanQuery.includes('accounts payable')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-fin-003') || null;
        if (matchedDoc) {
          relevanceScore = 0.95;
          relevantSnippet = 'Coupa procurement system. PO required for expenses > ₹50,000. 3-way matching of PO, Goods Receipt, and Invoice before payment release within 30 days.';
          responseText = `According to the **Nexora Vendor Procurement & Accounts Payable SOP (NEX-FIN-PROC-003)**:

• **Purchase Orders:** All corporate procurements exceeding **₹50,000** require an approved PO in Coupa prior to vendor engagement.
• **Three-Way Matching:** Accounts Payable requires verified alignment between the Purchase Order, Goods Receipt Note (GRN), and Vendor Tax Invoice before release.
• **Payment Terms:** Standard Net-30 payment terms executed via corporate banking integration.`;
        }
      } else if (cleanQuery.includes('vpn') || cleanQuery.includes('mfa') || cleanQuery.includes('globalprotect') || cleanQuery.includes('yubikey') || cleanQuery.includes('504')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-it-001') || null;
        if (matchedDoc) {
          relevanceScore = 0.95;
          relevantSnippet = 'GlobalProtect primary gateway vpn-mumbai.nexora.co.in. Error 504: restart GlobalProtect service and ipconfig /flushdns. YubiKey 5C NFC tap sensor for 3 seconds.';
          responseText = `According to the **Enterprise GlobalProtect VPN & Hardware MFA Troubleshooting Guide (NEX-IT-VPN-001)**:

• **Primary Gateway:** Connect to \`vpn-mumbai.nexora.co.in\` on Port 443.
• **Resolving Error 504 / Connection Timeout:**
  1. Restart the Palo Alto GlobalProtect background service via Windows Services or Mac launchctl.
  2. Flush DNS resolver cache using \`ipconfig /flushdns\` (Windows) or \`sudo dscacheutil -flushcache\` (macOS).
  3. Verify Zscaler client is running version 4.2+.
• **YubiKey MFA:** Insert your YubiKey 5C NFC into a USB port and hold the gold capacitive sensor for **3 seconds**. For urgent device resets, contact \`#it-urgent-helpdesk\` on Slack.`;
        }
      } else if (cleanQuery.includes('password') || cleanQuery.includes('rotation') || cleanQuery.includes('complexity') || cleanQuery.includes('zero-trust')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-it-002') || null;
        if (matchedDoc) {
          relevanceScore = 0.96;
          relevantSnippet = 'Minimum 16 characters with uppercase, number, and 2 special characters. Rotated every 90 days. Okta & AWS SSO automated lockout on compromise.';
          responseText = `Per the **Zero-Trust Endpoint Security & 90-Day Password Rotation Standard (NEX-IT-SEC-002)**:

• **Complexity Standards:** Minimum **16 characters**, containing at least one uppercase letter, one digit, and at least two special characters. Dictionary words and consecutive patterns are rejected.
• **Rotation Cadence:** Passwords must be updated every **90 calendar days** via Okta.
• **Automated Threat Lockout:** AWS GuardDuty dark-web monitoring will initiate an automated account freeze within 5 minutes if leaked credentials match your email.`;
        }
      } else if (cleanQuery.includes('iam') || cleanQuery.includes('least privilege') || cleanQuery.includes('kms') || cleanQuery.includes('assume role') || cleanQuery.includes('boundary')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-it-003') || null;
        if (matchedDoc) {
          relevanceScore = 0.97;
          relevantSnippet = 'AWS IAM permission boundaries enforce least-privilege. KMS CMKs rotated annually. Cross-account role assumption requires MFA token with maximum 1-hour session duration.';
          responseText = `According to the **AWS IAM Least-Privilege & KMS Encryption Architecture Guide (NEX-IT-IAM-003)**:

• **Permission Boundaries:** All IAM roles are bounded to prohibit \`iam:*FullAccess\` and require explicit CloudTrail logging.
• **KMS Customer Managed Keys:** CMK rotation occurs every 365 days with strict key policy separation between admins and decrypt callers.
• **Cross-Account Role Assumption:** STS \`AssumeRole\` requires active MFA and is limited to a strict 1-hour session duration.`;
        }
      } else if (cleanQuery.includes('deploy') || cleanQuery.includes('canary') || cleanQuery.includes('kubernetes') || cleanQuery.includes('pipeline') || cleanQuery.includes('runbook') || cleanQuery.includes('argo') || cleanQuery.includes('rollback')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-eng-001') || null;
        if (matchedDoc) {
          relevanceScore = 0.99;
          relevantSnippet = 'ArgoCD Canary on EKS cluster. 10% traffic for 15 mins. CloudWatch error rate > 0.1% triggers 60s rollback. Lambda uses Linear10PercentEvery1Minute.';
          responseText = `According to the **Nexora Cloud Production Deployment Runbook (NEX-ENG-ARC-001)**:

1. **Pre-Deployment Checks:** 0 Critical/High SonarQube issues and >=85% unit test coverage required, with 2 Senior Engineer approvals.
2. **Canary Rollout (EKS):**
   - **Phase 1:** 10% traffic routed to Canary for 15 minutes.
   - **Automated Rollback:** CloudWatch metric alarms trigger rollback within 60 seconds if HTTP 5xx errors exceed 0.1%.
   - **Phase 2:** 50% traffic for 30 minutes, followed by 100% promotion.
3. **Lambda Microservices:** Deployed via AWS SAM / CodeDeploy with \`Linear10PercentEvery1Minute\` traffic shifting and automated pre/post smoke tests.`;
        }
      } else if (cleanQuery.includes('bonus') || cleanQuery.includes('executive compensation') || cleanQuery.includes('equity') || cleanQuery.includes('salary matrix')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-fin-002') || null;
        if (matchedDoc) {
          relevanceScore = 0.94;
          relevantSnippet = 'Executive Level E-1 Base CTC ₹45,00,000 to ₹85,00,000+ with 35% to 50% target bonus based on EBITDA. Director Level D-1 Base CTC ₹30,00,000 to ₹45,00,000.';
          responseText = `Authorized Retrieval from **Executive Compensation & Q3 Performance Bonus Allocation Matrix (NEX-FIN-PAY-002)** [RESTRICTED]:

• **Executive Tier E-1 (VPs & SVPs):** Fixed Base CTC of **₹45,00,000 to ₹85,00,000+** per annum with 35% to 50% target performance bonus tied to company ARR targets and EBITDA performance.
• **Director Tier D-1:** Fixed Base CTC of **₹30,00,000 to ₹45,00,000** per annum with 20% to 30% performance bonus target.
• **Statutory & Retirals:** Includes 12% Employer EPF contribution and Gratuity under Payment of Gratuity Act 1972.
• **Equity Vesting:** Annual ESOP / RSU refresh grants occur annually on October 1st following performance committee review.`;
        }
      } else if (cleanQuery.includes('leave') || cleanQuery.includes('pto') || cleanQuery.includes('parental') || cleanQuery.includes('vacation') || cleanQuery.includes('bereavement')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-hr-003') || null;
        if (matchedDoc) {
          relevanceScore = 0.95;
          relevantSnippet = '22 PTO vacation days per year, 5 roll over into Q1. 26 weeks fully paid Maternity leave under Maternity Benefit Act, 4 weeks Paternity leave. 5 days bereavement leave.';
          responseText = `According to **Nexora Technologies India Leave & Time-Off Policy (NEX-HR-LV-003)**:

• **Earned Leave (EL/PTO):** Full-time employees accrue **22 paid annual leave days**, with up to 5 days eligible to roll over into Q1.
• **Maternity & Paternity Leave:** **26 weeks of 100% fully paid Maternity Leave** (compliant with Maternity Benefit Amendment Act) and **4 weeks fully paid Paternity Leave**.
• **Bereavement & Special Leave:** 5 consecutive business days of fully paid leave.`;
        }
      } else if (cleanQuery.includes('disaster recovery') || cleanQuery.includes('rto') || cleanQuery.includes('rpo') || cleanQuery.includes('failover') || cleanQuery.includes('bcp') || cleanQuery.includes('backup')) {
        matchedDoc = accessibleDocs.find(d => d.id === 'doc-ops-001') || null;
        if (matchedDoc) {
          relevanceScore = 0.97;
          relevantSnippet = 'RTO <= 15 minutes for Tier-1 APIs. RPO <= 5 minutes via DynamoDB Global Tables and Aurora Multi-Region. Route 53 ARC automated failover.';
          responseText = `Per the **Nexora Business Continuity & Multi-Region Disaster Recovery Protocol (NEX-OPS-DR-001)**:

• **Target SLAs:**
  - **RTO (Recovery Time Objective):** Maximum **15 minutes** for Tier-1 Customer & Payment APIs.
  - **RPO (Recovery Point Objective):** Maximum **5 minutes** via DynamoDB Global Tables and Aurora Multi-Region.
• **Failover Protocol:** Route 53 Application Recovery Controller (ARC) initiates automated DNS failover from \`ap-south-1 (Mumbai)\` to \`ap-south-2 (Hyderabad)\` if primary region error rates exceed 5% for 3 minutes.`;
        }
      }
    }

    // Strict Anti-Hallucination Fallback if no matching authorized document
    if (!matchedDoc) {
      const fallbackLog: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: user.email,
        department: user.department,
        action: 'QUERY_KNOWLEDGE_BASE',
        resource: 'Bedrock-KB:nexora-enterprise-kb-01',
        status: 'SUCCESS',
        details: `Query executed with no matching document chunks found in authorized scope [${user.department}].`,
        ipAddress: '10.0.1.5',
        awsService: 'Bedrock'
      };
      this.auditLogs.unshift(fallbackLog);
      this.saveState();

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🔍 **No Grounded Company Documentation Found**\n\nI searched Nexora's verified knowledge base for: *"${question}"* across your authorized department repositories (${user.department}, Public Internal), but **no authoritative policy, runbook, or standard operating procedure contains sufficient information to answer this question.**\n\nTo prevent hallucination, EnterpriseIQ only provides answers grounded in official company documents. If you believe this documentation exists, please contact your department administrator to upload or index the document.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: 0.15,
        latencyMs: 380,
        tokensUsed: { prompt: 70, completion: 48, total: 118 }
      };
    }

    // Construct valid Citations
    citations.push({
      id: `cit-${Date.now()}-1`,
      documentId: matchedDoc.id,
      documentTitle: matchedDoc.title,
      department: matchedDoc.department,
      classification: matchedDoc.classification,
      s3Uri: `s3://${matchedDoc.s3Bucket}/${matchedDoc.s3Key}`,
      pageNumber: 1,
      snippet: relevantSnippet,
      relevanceScore: relevanceScore
    });

    // Simulate streaming effect if callback provided
    if (onTokenChunk) {
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 20));
        onTokenChunk(words[i] + ' ');
      }
    }

    const latency = Date.now() - startTime + 420;

    // Update metrics
    this.metrics.totalQueriesToday += 1;
    this.metrics.bedrockTokensToday += 320;
    this.metrics.departmentQueryDistribution[user.department] = (this.metrics.departmentQueryDistribution[user.department] || 0) + 1;
    
    // Log audit event
    const successLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: user.email,
      department: user.department,
      action: 'QUERY_KNOWLEDGE_BASE',
      resource: `Bedrock-KB:${matchedDoc.id}`,
      status: 'SUCCESS',
      details: `Retrieved citation from ${matchedDoc.fileName} (Relevance: ${(relevanceScore * 100).toFixed(0)}%). Grounded Bedrock response generated in ${latency}ms.`,
      ipAddress: '10.0.1.20',
      awsService: 'Bedrock'
    };
    this.auditLogs.unshift(successLog);
    this.saveState();

    // Detect Bedrock Action Group / Tool Execution Intents
    let actionIntent: ChatMessage['actionIntent'] = undefined;

    if ((cleanQuery.includes('apply') || cleanQuery.includes('request') || cleanQuery.includes('submit') || cleanQuery.includes('take')) && (cleanQuery.includes('leave') || cleanQuery.includes('vacation') || cleanQuery.includes('pto') || cleanQuery.includes('time off') || cleanQuery.includes('days off'))) {
      const isSick = cleanQuery.includes('sick');
      const isParental = cleanQuery.includes('parental');
      actionIntent = {
        type: 'LEAVE_REQUEST',
        title: 'Submit Leave Request (Nexora HRMS)',
        status: 'READY',
        data: {
          leaveType: isSick ? 'SICK_LEAVE' : isParental ? 'PARENTAL' : 'VACATION',
          startDate: '2026-10-15',
          endDate: '2026-10-18',
          totalDays: 3,
          reason: question.length > 20 ? question : 'Personal vacation time-off in accordance with NEX-HR-LV-003',
          policyCitation: 'NEX-HR-LV-003 (Section 3.1 Paid Annual Leave)'
        }
      };
    } else if ((cleanQuery.includes('ticket') || cleanQuery.includes('broken') || cleanQuery.includes('cannot connect') || cleanQuery.includes('error 504') || cleanQuery.includes('helpdesk') || cleanQuery.includes('flickering') || cleanQuery.includes('it support')) && (cleanQuery.includes('create') || cleanQuery.includes('submit') || cleanQuery.includes('open') || cleanQuery.includes('escalate') || cleanQuery.includes('fix') || cleanQuery.includes('help') || cleanQuery.includes('report'))) {
      actionIntent = {
        type: 'SUPPORT_TICKET',
        title: 'Open IT Support Ticket (ServiceNow / Jira)',
        status: 'READY',
        data: {
          category: cleanQuery.includes('vpn') ? 'VPN_NETWORK' : cleanQuery.includes('access') ? 'SOFTWARE_ACCESS' : cleanQuery.includes('laptop') || cleanQuery.includes('monitor') ? 'HARDWARE' : 'OTHER',
          priority: cleanQuery.includes('urgent') || cleanQuery.includes('critical') || cleanQuery.includes('p1') ? 'CRITICAL' : 'HIGH',
          subject: question.length > 60 ? question.substring(0, 60) + '...' : question,
          description: `User-reported issue via Bedrock Workplace Assistant: ${question}`,
          conversationContext: responseText
        }
      };
    } else if ((cleanQuery.includes('expense') || cleanQuery.includes('reimburse') || cleanQuery.includes('claim')) && (cleanQuery.includes('submit') || cleanQuery.includes('file') || cleanQuery.includes('create') || cleanQuery.includes('₹') || cleanQuery.includes('rupee') || cleanQuery.includes('rs') || cleanQuery.includes('spend'))) {
      const match = question.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
      const rawAmount = match ? parseFloat(match[1].replace(/,/g, '')) : 2500.00;
      const amount = isNaN(rawAmount) || rawAmount <= 0 ? 2500.00 : rawAmount;
      actionIntent = {
        type: 'EXPENSE_CLAIM',
        title: 'Submit Expense Claim (SAP Concur Integration)',
        status: 'READY',
        data: {
          category: cleanQuery.includes('dinner') || cleanQuery.includes('lunch') || cleanQuery.includes('meal') ? 'DOMESTIC_MEAL' : cleanQuery.includes('hotel') ? 'HOTEL_LODGING' : cleanQuery.includes('broadband') || cleanQuery.includes('internet') ? 'INTERNET_STIPEND' : 'DOMESTIC_MEAL',
          amount: amount,
          currency: 'INR',
          merchant: cleanQuery.includes('hotel') ? 'ITC Gardenia Bengaluru' : cleanQuery.includes('dinner') || cleanQuery.includes('lunch') ? 'The Taj Mahal Palace Mumbai' : cleanQuery.includes('broadband') ? 'Airtel Xstream Fiber' : 'Tata Croma Electronics',
          description: `Business travel & workplace reimbursement: ${question}`,
          policyLimitNote: 'Within NEX-FIN-EXP-001 ₹2,500/day domestic meal per-diem limit'
        }
      };
    } else if ((cleanQuery.includes('access') || cleanQuery.includes('iam') || cleanQuery.includes('permission') || cleanQuery.includes('bastion')) && (cleanQuery.includes('request') || cleanQuery.includes('grant') || cleanQuery.includes('elevate') || cleanQuery.includes('need'))) {
      actionIntent = {
        type: 'ACCESS_REQUEST',
        title: 'Request Elevated IAM Role Access',
        status: 'READY',
        data: {
          systemName: cleanQuery.includes('aws') || cleanQuery.includes('iam') ? 'AWS_IAM_ROLE' : cleanQuery.includes('bastion') ? 'PROD_BASTION_SSH' : cleanQuery.includes('github') ? 'GITHUB_ENTERPRISE' : 'AWS_IAM_ROLE',
          roleRequested: 'arn:aws:iam::123456789012:role/EKS-Prod-Deployer-Temporary',
          justification: `Requested via Bedrock Workplace Assistant: ${question}`,
          durationDays: 7
        }
      };
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: citations,
      confidenceScore: relevanceScore,
      latencyMs: latency,
      tokensUsed: {
        prompt: 184,
        completion: 142,
        total: 326
      },
      departmentScope: user.department,
      securityStatus: 'CLEAN',
      actionIntent: actionIntent
    };
  }

  // Submit feedback
  public async submitFeedback(feedback: Omit<FeedbackRecord, 'id' | 'timestamp' | 'status'>): Promise<FeedbackRecord> {
    const newRecord: FeedbackRecord = {
      ...feedback,
      id: `fb-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'PENDING_REVIEW'
    };
    this.feedbackRecords.unshift(newRecord);
    this.saveState();
    return newRecord;
  }

  // Document Upload & Ingestion
  public async uploadDocument(
    file: File,
    department: Department,
    classification: Classification,
    tags: string[],
    uploadedBy: string
  ): Promise<DocumentItem> {
    // Generate S3 key and mock pre-signed upload
    const cleanFileName = file.name.replace(/\s+/g, '-');
    const deptPrefix = department.toLowerCase().replace(/\s+/g, '');
    const s3Key = `${deptPrefix}/uploads/${Date.now()}-${cleanFileName}`;

    const newDoc: DocumentItem = {
      id: `doc-custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      fileName: cleanFileName,
      department: department,
      classification: classification,
      s3Key: s3Key,
      s3Bucket: 'nexora-enterprise-kb-vault-prod',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: (file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt') as any,
      uploadedBy: uploadedBy,
      uploadDate: new Date().toISOString().split('T')[0],
      version: '1.0',
      status: 'INDEXED',
      chunkCount: Math.max(8, Math.floor(file.size / 15000)),
      kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/nexora-kb-cmk-01',
      tags: tags.length > 0 ? tags : [department, classification],
      summary: `Uploaded document for ${department} classified under ${classification}. Processed via EventBridge and SQS ingestion worker.`,
      content: `CONTENT EXTRACTED FROM ${file.name}\nDepartment: ${department}\nClassification: ${classification}\nIndexed into Bedrock OpenSearch Serverless collection.`
    };

    this.documents.unshift(newDoc);
    this.metrics.totalIndexedDocuments += 1;

    // Log upload audit
    const uploadLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: uploadedBy,
      department: department,
      action: 'DOCUMENT_UPLOAD',
      resource: `S3:nexora-enterprise-kb-vault-prod/${s3Key}`,
      status: 'SUCCESS',
      details: `Pre-signed S3 upload completed. EventBridge routed to SQS Ingestion Queue. Bedrock KB synced ${newDoc.chunkCount} vector chunks.`,
      ipAddress: '10.0.3.11',
      awsService: 'S3'
    };
    this.auditLogs.unshift(uploadLog);
    this.saveState();

    return newDoc;
  }

  // Trigger Bedrock Knowledge Base Ingestion Sync
  public async triggerKnowledgeBaseSync(adminEmail: string): Promise<{ success: boolean; durationSec: number; indexedCount: number }> {
    this.metrics.kbSyncStatus = 'SYNCING';
    this.saveState();

    await new Promise(r => setTimeout(r, 2500)); // Simulate async sync

    this.metrics.kbSyncStatus = 'AVAILABLE';
    this.metrics.lastSyncTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    
    const syncLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: adminEmail,
      department: 'All Departments',
      action: 'KB_SYNC_TRIGGER',
      resource: 'BedrockKnowledgeBase:nexora-enterprise-kb-01',
      status: 'SUCCESS',
      details: `Incremental vector sync completed. ${this.documents.length} documents verified in OpenSearch Serverless index.`,
      ipAddress: '10.0.1.2',
      awsService: 'Bedrock'
    };
    this.auditLogs.unshift(syncLog);
    this.saveState();

    return {
      success: true,
      durationSec: 14.8,
      indexedCount: this.documents.length
    };
  }

  // --- CORPORATE MODULE 11: DOCUMENT APPROVAL & GOVERNANCE WORKFLOW ---
  public getApprovals(): DocumentApproval[] {
    return [...this.approvals];
  }

  public getPendingApprovalsCount(): number {
    return this.approvals.filter(a => a.status === 'PENDING').length;
  }

  public async submitDocumentForApproval(
    file: File,
    department: Department,
    classification: Classification,
    submittedBy: string,
    diffSummary: string,
    version: string = '1.0'
  ): Promise<DocumentApproval> {
    const cleanFileName = file.name.replace(/\s+/g, '-');
    const deptPrefix = department.toLowerCase().replace(/\s+/g, '');
    const docId = `doc-stage-${Date.now()}`;
    const approvalId = `appr-${Date.now()}`;

    // Create staged document (PENDING_APPROVAL)
    const stagedDoc: DocumentItem = {
      id: docId,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      fileName: cleanFileName,
      department: department,
      classification: classification,
      s3Key: `${deptPrefix}/staging/${cleanFileName}`,
      s3Bucket: 'nexora-enterprise-kb-staging-quarantine',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: (file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt') as any,
      uploadedBy: submittedBy,
      uploadDate: new Date().toISOString().split('T')[0],
      version: version,
      status: 'PENDING_APPROVAL',
      chunkCount: Math.max(6, Math.floor(file.size / 15000)),
      kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/nexora-kb-staging-cmk',
      tags: [department, classification, 'STAGED_REVIEW'],
      summary: `Staged policy document awaiting department manager review. Proposed updates: ${diffSummary}`,
      content: `STAGED DRAFT CONTENT EXTRACTED FROM ${file.name}\nDepartment: ${department}\nStatus: PENDING_APPROVAL\nDiff: ${diffSummary}`
    };

    const approvalRecord: DocumentApproval = {
      id: approvalId,
      documentId: docId,
      documentTitle: stagedDoc.title,
      fileName: cleanFileName,
      department: department,
      classification: classification,
      submittedBy: submittedBy,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST',
      status: 'PENDING',
      version: version,
      diffSummary: diffSummary
    };

    this.documents.unshift(stagedDoc);
    this.approvals.unshift(approvalRecord);
    this.metrics.pendingApprovalsCount = this.approvals.filter(a => a.status === 'PENDING').length;

    // Audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: submittedBy,
      department: department,
      action: 'DOCUMENT_UPLOAD',
      resource: `S3:staging-quarantine/${stagedDoc.s3Key}`,
      status: 'SUCCESS',
      details: `Document submitted to S3 staging quarantine. Created approval ticket ${approvalId}. Manager approval required prior to vector indexing.`,
      ipAddress: '10.0.4.19',
      awsService: 'S3'
    });

    this.saveState();
    return approvalRecord;
  }

  public async approveDocument(approvalId: string, reviewerEmail: string, reviewNotes?: string): Promise<boolean> {
    const approval = this.approvals.find(a => a.id === approvalId);
    if (!approval) return false;

    approval.status = 'APPROVED';
    approval.reviewedBy = reviewerEmail;
    approval.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    approval.reviewNotes = reviewNotes || 'Approved for enterprise production indexing.';

    // Promote document status to INDEXED
    const doc = this.documents.find(d => d.id === approval.documentId);
    if (doc) {
      doc.status = 'INDEXED';
      doc.s3Bucket = 'nexora-enterprise-kb-vault-prod';
      doc.s3Key = doc.s3Key.replace('staging/', 'policies/');
      doc.approvalNotes = reviewNotes;
    }

    this.metrics.pendingApprovalsCount = this.approvals.filter(a => a.status === 'PENDING').length;

    // Log approval audit
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reviewerEmail,
      department: approval.department,
      action: 'DOCUMENT_APPROVED',
      resource: `Document:${approval.documentTitle} (${approval.version})`,
      status: 'SUCCESS',
      details: `Department Manager approved promotion from staging quarantine to production S3. Triggered EventBridge rule for vector embedding.`,
      ipAddress: '10.0.1.5',
      awsService: 'Bedrock'
    });

    this.saveState();
    return true;
  }

  public async rejectDocument(approvalId: string, reviewerEmail: string, reviewNotes: string): Promise<boolean> {
    const approval = this.approvals.find(a => a.id === approvalId);
    if (!approval) return false;

    approval.status = 'REJECTED';
    approval.reviewedBy = reviewerEmail;
    approval.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    approval.reviewNotes = reviewNotes;

    const doc = this.documents.find(d => d.id === approval.documentId);
    if (doc) {
      doc.status = 'REJECTED';
    }

    this.metrics.pendingApprovalsCount = this.approvals.filter(a => a.status === 'PENDING').length;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reviewerEmail,
      department: approval.department,
      action: 'DOCUMENT_REJECTED',
      resource: `Document:${approval.documentTitle}`,
      status: 'DENIED',
      details: `Document rejected during governance review. Reason: ${reviewNotes}`,
      ipAddress: '10.0.1.5',
      awsService: 'Bedrock'
    });

    this.saveState();
    return true;
  }

  // --- CORPORATE MODULE 17: IT HELPDESK & TICKET ESCALATION ---
  public getTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  public getTicketsForUser(user: User): SupportTicket[] {
    if (user.role === 'Admin' || user.department === 'IT Support' || user.department === 'Management') {
      return [...this.tickets];
    }
    return this.tickets.filter(t => t.employeeEmail === user.email || t.department === user.department);
  }

  public async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'slaHours'>): Promise<SupportTicket> {
    const ticketId = `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    
    // Calculate SLA target based on priority
    const slaHoursMap: Record<SupportTicket['priority'], number> = {
      CRITICAL: 2,
      HIGH: 4,
      MEDIUM: 8,
      LOW: 24
    };

    const newTicket: SupportTicket = {
      ...ticketData,
      id: ticketId,
      createdAt: now,
      updatedAt: now,
      slaHours: slaHoursMap[ticketData.priority] || 8
    };

    this.tickets.unshift(newTicket);
    this.metrics.openTicketsCount = this.tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: ticketData.employeeEmail,
      department: ticketData.department,
      action: 'TICKET_CREATED',
      resource: `SupportTicket:${ticketId}`,
      status: 'SUCCESS',
      details: `Escalated AI unresolved inquiry to IT Support. Priority: ${ticketData.priority}. SLA Target: ${newTicket.slaHours}h. Assigned: ${ticketData.assignedTo}.`,
      ipAddress: '10.0.3.45',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return newTicket;
  }

  public async updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolutionNotes?: string, resolverEmail?: string): Promise<boolean> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;

    this.metrics.openTicketsCount = this.tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    if (status === 'RESOLVED' || status === 'CLOSED') {
      this.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: resolverEmail || 'it.support@nexora.com',
        department: ticket.department,
        action: 'TICKET_RESOLVED',
        resource: `SupportTicket:${ticketId}`,
        status: 'SUCCESS',
        details: `Ticket closed with resolution: ${resolutionNotes || 'Resolved by IT support engineer.'}`,
        ipAddress: '10.0.2.14',
        awsService: 'DynamoDB'
      });
    }

    this.saveState();
    return true;
  }

  // --- CORPORATE MODULE 19 & 22: KNOWLEDGE GAPS & AI EVALUATION ---
  public getKnowledgeGaps(): KnowledgeGap[] {
    return [...this.knowledgeGaps];
  }

  public async updateGapStatus(gapId: string, status: KnowledgeGap['status']): Promise<boolean> {
    const gap = this.knowledgeGaps.find(g => g.id === gapId);
    if (!gap) return false;
    gap.status = status;
    this.saveState();
    return true;
  }

  public getAiEvaluations(): AiEvaluationResult[] {
    return [...this.aiEvaluations];
  }

  public async runAiEvaluation(testId: string): Promise<AiEvaluationResult> {
    const test = this.aiEvaluations.find(e => e.testId === testId);
    if (!test) throw new Error('Evaluation test not found');

    await new Promise(r => setTimeout(r, 600)); // Simulate test execution
    test.latencyMs = Math.floor(450 + Math.random() * 200);
    this.saveState();
    return test;
  }

  // --- WORKPLACE MODULE 1: HR PTO & LEAVE MANAGEMENT ---
  public getLeaveRequests(user?: User): LeaveRequest[] {
    if (!user || user.role === 'Admin' || user.department === 'Human Resources' || user.department === 'Management') {
      return [...this.leaveRequests];
    }
    return this.leaveRequests.filter(l => l.employeeEmail === user.email);
  }

  public getPtoBalance(userEmail: string): PtoBalance {
    return this.ptoBalances[userEmail] || {
      employeeId: 'NEX-8821',
      vacationDaysTotal: 20,
      vacationDaysUsed: 5,
      sickDaysTotal: 10,
      sickDaysUsed: 1,
      parentalWeeksTotal: 18,
      floatingHolidaysRemaining: 2,
      remoteDaysAllowanceMonthly: 8
    };
  }

  public async submitLeaveRequest(reqData: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): Promise<LeaveRequest> {
    const leaveId = `leave-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';

    const newLeave: LeaveRequest = {
      ...reqData,
      id: leaveId,
      status: 'PENDING',
      appliedAt: now
    };

    this.leaveRequests.unshift(newLeave);

    // Audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reqData.employeeEmail,
      department: reqData.department,
      action: 'LEAVE_REQUESTED',
      resource: `LeaveRequest:${leaveId} (${reqData.leaveType}, ${reqData.totalDays} days)`,
      status: 'SUCCESS',
      details: `Submitted leave request from ${reqData.startDate} to ${reqData.endDate}. Reason: ${reqData.reason}`,
      ipAddress: '10.0.4.55',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return newLeave;
  }

  public async reviewLeaveRequest(leaveId: string, status: 'APPROVED' | 'REJECTED', notes?: string, reviewerEmail?: string): Promise<boolean> {
    const leave = this.leaveRequests.find(l => l.id === leaveId);
    if (!leave) return false;

    leave.status = status;
    leave.reviewedBy = reviewerEmail || 'sarah.jenkins@nexora.com';
    leave.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    if (notes) leave.approvalNotes = notes;

    // Deduct PTO balance if approved
    if (status === 'APPROVED' && this.ptoBalances[leave.employeeEmail]) {
      if (leave.leaveType === 'VACATION') {
        this.ptoBalances[leave.employeeEmail].vacationDaysUsed += leave.totalDays;
      } else if (leave.leaveType === 'SICK_LEAVE') {
        this.ptoBalances[leave.employeeEmail].sickDaysUsed += leave.totalDays;
      } else if (leave.leaveType === 'FLOATING_HOLIDAY') {
        this.ptoBalances[leave.employeeEmail].floatingHolidaysRemaining = Math.max(0, this.ptoBalances[leave.employeeEmail].floatingHolidaysRemaining - leave.totalDays);
      }
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reviewerEmail || 'sarah.jenkins@nexora.com',
      department: leave.department,
      action: 'LEAVE_APPROVED',
      resource: `LeaveRequest:${leaveId}`,
      status: status === 'APPROVED' ? 'SUCCESS' : 'DENIED',
      details: `Manager reviewed leave request. Status: ${status}. Notes: ${notes || 'Approved'}`,
      ipAddress: '10.0.1.8',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return true;
  }

  // --- WORKPLACE MODULE 2: IT ASSET & ACCESS PROVISIONING ---
  public getItAssets(userEmail?: string): ItAsset[] {
    if (userEmail) {
      return this.itAssets.filter(a => a.assignedEmail === userEmail);
    }
    return [...this.itAssets];
  }

  public getAccessRequests(userEmail?: string): AccessRequest[] {
    if (userEmail) {
      return this.accessRequests.filter(r => r.employeeEmail === userEmail);
    }
    return [...this.accessRequests];
  }

  public async submitAccessRequest(reqData: Omit<AccessRequest, 'id' | 'requestedAt' | 'status'>): Promise<AccessRequest> {
    const reqId = `req-acc-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';

    const newReq: AccessRequest = {
      ...reqData,
      id: reqId,
      status: 'PENDING',
      requestedAt: now
    };

    this.accessRequests.unshift(newReq);

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reqData.employeeEmail,
      department: reqData.department,
      action: 'QUERY_KNOWLEDGE_BASE',
      resource: `AccessRequest:${reqId} (${reqData.systemName})`,
      status: 'SUCCESS',
      details: `Submitted access request for ${reqData.roleRequested}. Justification: ${reqData.justification}`,
      ipAddress: '10.0.3.12',
      awsService: 'Cognito'
    });

    this.saveState();
    return newReq;
  }

  public async provisionAccessRequest(requestId: string, reviewerEmail: string): Promise<boolean> {
    const req = this.accessRequests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'PROVISIONED';
    req.reviewedBy = reviewerEmail;
    req.provisionedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';
    req.expiryDate = new Date(Date.now() + req.durationDays * 86400000).toISOString().replace('T', ' ').substring(0, 19) + ' EST';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reviewerEmail,
      department: req.department,
      action: 'ACCESS_PROVISIONED',
      resource: `AccessRequest:${requestId} (${req.systemName})`,
      status: 'SUCCESS',
      details: `Security Architect provisioned ${req.roleRequested} for ${req.durationDays} days.`,
      ipAddress: '10.0.1.2',
      awsService: 'Cognito'
    });

    this.saveState();
    return true;
  }

  // --- WORKPLACE MODULE 3: FINANCE EXPENSE CLAIMS ---
  public getExpenseClaims(userEmail?: string): ExpenseClaim[] {
    if (userEmail) {
      return this.expenseClaims.filter(e => e.employeeEmail === userEmail);
    }
    return [...this.expenseClaims];
  }

  public async submitExpenseClaim(claimData: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'submittedAt' | 'status'>): Promise<ExpenseClaim> {
    const claimNumber = `EXP-${Math.floor(10000 + Math.random() * 90000)}`;
    const claimId = `exp-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';

    const newClaim: ExpenseClaim = {
      ...claimData,
      id: claimId,
      claimNumber: claimNumber,
      status: 'SUBMITTED',
      submittedAt: now
    };

    this.expenseClaims.unshift(newClaim);

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: claimData.employeeEmail,
      department: claimData.department,
      action: 'EXPENSE_SUBMITTED',
      resource: `ExpenseClaim:${claimNumber} ($${claimData.amount.toFixed(2)} ${claimData.currency})`,
      status: 'SUCCESS',
      details: `Submitted expense claim for ${claimData.category}. Merchant: ${claimData.merchant}. ${claimData.policyLimitNote}`,
      ipAddress: '10.0.5.21',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return newClaim;
  }

  public async reviewExpenseClaim(claimId: string, status: 'APPROVED' | 'REJECTED' | 'REIMBURSED', reviewerEmail?: string): Promise<boolean> {
    const claim = this.expenseClaims.find(c => c.id === claimId);
    if (!claim) return false;

    claim.status = status;
    claim.reviewedBy = reviewerEmail || 'sophia.rodriguez@nexora.com';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: reviewerEmail || 'sophia.rodriguez@nexora.com',
      department: claim.department,
      action: 'EXPENSE_APPROVED',
      resource: `ExpenseClaim:${claim.claimNumber}`,
      status: status === 'REJECTED' ? 'DENIED' : 'SUCCESS',
      details: `Finance Controller updated claim status to ${status}. Amount: $${claim.amount.toFixed(2)} ${claim.currency}`,
      ipAddress: '10.0.1.19',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return true;
  }

  // --- WORKPLACE MODULE 4: ANNOUNCEMENTS & COMPLIANCE ACKNOWLEDGMENTS ---
  public getAnnouncements(): CorporateAnnouncement[] {
    return [...this.announcements];
  }

  public async acknowledgePolicy(policyDocId: string, policyTitle: string, user: User, version: string): Promise<PolicyAcknowledgment> {
    const ackId = `ack-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST';

    const newAck: PolicyAcknowledgment = {
      id: ackId,
      policyDocId: policyDocId,
      policyTitle: policyTitle,
      employeeEmail: user.email,
      employeeName: user.name,
      department: user.department,
      acknowledgedAt: now,
      version: version
    };

    this.policyAcks.unshift(newAck);

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: user.email,
      department: user.department,
      action: 'POLICY_ACKNOWLEDGED',
      resource: `Policy:${policyTitle} (v${version})`,
      status: 'SUCCESS',
      details: `Employee submitted cryptographic digital acknowledgment for compliance policy.`,
      ipAddress: '10.0.2.88',
      awsService: 'DynamoDB'
    });

    this.saveState();
    return newAck;
  }

  public getPolicyAcknowledgments(userEmail?: string): PolicyAcknowledgment[] {
    if (userEmail) {
      return this.policyAcks.filter(a => a.employeeEmail === userEmail);
    }
    return [...this.policyAcks];
  }

  // --- WORKPLACE MODULE 5: ORG DIRECTORY ---
  public getOrgDirectory(): OrgEmployee[] {
    return [...this.orgDirectory];
  }

  // Audit Logs & Feedback
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public getFeedbackRecords(): FeedbackRecord[] {
    return [...this.feedbackRecords];
  }

  public getAdminMetrics(): AdminMetrics {
    return { ...this.metrics };
  }

  public getSystemHealth(): SystemHealthStatus[] {
    return [...SYSTEM_HEALTH_DATA];
  }

  // Convenience aliases for Bedrock Agent Action Calling
  public createLeaveRequest = this.submitLeaveRequest.bind(this);
  public createExpenseClaim = this.submitExpenseClaim.bind(this);
  public createAccessRequest = this.submitAccessRequest.bind(this);

  // Reset to default factory state if needed
  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.METRICS);
    localStorage.removeItem(STORAGE_KEYS.APPROVALS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.GAPS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.LEAVES);
    localStorage.removeItem(STORAGE_KEYS.PTO);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_REQ);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.POLICY_ACKS);
    localStorage.removeItem(STORAGE_KEYS.ORG_DIR);
    this.loadState();
  }
}

export const apiService = new EnterpriseApiService();


