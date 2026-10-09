export type Department = 
  | 'Human Resources'
  | 'Engineering'
  | 'Finance'
  | 'IT Support'
  | 'Operations'
  | 'Management'
  | 'All Departments';

export type Classification = 
  | 'PUBLIC_INTERNAL'
  | 'DEPARTMENT_ONLY'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type UserRole = 'Admin' | 'Employee' | 'Manager' | 'Auditor' | 'Security';

export type PortalPerspective = 'employee' | 'manager' | 'admin' | 'security';

export type DocumentStatus = 
  | 'INDEXED' 
  | 'INGESTING' 
  | 'PENDING_APPROVAL' 
  | 'REJECTED' 
  | 'RETIRED' 
  | 'FAILED' 
  | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar: string;
  cognitoGroups: string[];
  clearanceLevel: Classification[];
  employeeId: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  department: Department;
  classification: Classification;
  s3Key: string;
  s3Bucket: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'markdown';
  uploadedBy: string;
  uploadDate: string;
  version: string;
  status: DocumentStatus;
  summary: string;
  content: string;
  chunkCount: number;
  kmsKeyId: string;
  tags: string[];
  owner?: string;
  effectiveDate?: string;
  reviewDate?: string;
  accessGroups?: string[];
  approvalNotes?: string;
}

export interface DocumentApproval {
  id: string;
  documentId: string;
  documentTitle: string;
  fileName: string;
  department: Department;
  classification: Classification;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  version: string;
  diffSummary: string;
}

export interface SupportTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: Department;
  category: 'VPN_NETWORK' | 'HARDWARE' | 'SOFTWARE_ACCESS' | 'PAYROLL_HR' | 'SECURITY_INCIDENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  conversationContext?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  resolutionNotes?: string;
  relatedDocId?: string;
}

export interface KnowledgeGap {
  id: string;
  topic: string;
  department: Department;
  queryCount: number;
  avgConfidence: number;
  lastQueried: string;
  status: 'UNRESOLVED' | 'DOC_REQUESTED' | 'RESOLVED';
  sampleQueries: string[];
  suggestedAction: string;
}

export interface AiEvaluationResult {
  testId: string;
  testName: string;
  department: Department;
  query: string;
  groundTruthDocId: string;
  contextRelevanceScore: number;
  groundednessScore: number;
  answerRelevanceScore: number;
  rbacPassed: boolean;
  latencyMs: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  notes: string;
}

export interface Citation {
  id: string;
  documentId: string;
  documentTitle: string;
  department: Department;
  classification: Classification;
  s3Uri: string;
  pageNumber?: number;
  snippet: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citations?: Citation[];
  confidenceScore?: number;
  latencyMs?: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  departmentScope?: Department;
  isStreaming?: boolean;
  feedback?: {
    rating: 'helpful' | 'not_helpful';
    category?: string;
    comment?: string;
  };
  securityStatus?: 'CLEAN' | 'BLOCKED_INJECTION' | 'ACCESS_DENIED' | 'UNAUTHORIZED_DEPT';
  suggestTicketEscalation?: boolean;
  actionIntent?: {
    type: 'LEAVE_REQUEST' | 'SUPPORT_TICKET' | 'EXPENSE_CLAIM' | 'ACCESS_REQUEST';
    title: string;
    status?: 'READY' | 'EXECUTED';
    data: any;
  };
}

export interface FeedbackRecord {
  id: string;
  messageId: string;
  queryText: string;
  responseText: string;
  userEmail: string;
  department: Department;
  rating: 'helpful' | 'not_helpful';
  category: 'OUTDATED_INFO' | 'INCORRECT_SOURCE' | 'INCOMPLETE_ANSWER' | 'WRONG_DEPARTMENT' | 'OTHER';
  comment: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'RESOLVED' | 'DOC_UPDATE_REQUESTED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  department: Department;
  action: 
    | 'QUERY_KNOWLEDGE_BASE' 
    | 'DOCUMENT_UPLOAD' 
    | 'DOCUMENT_DELETE' 
    | 'KB_SYNC_TRIGGER' 
    | 'ACCESS_DENIED_BLOCKED' 
    | 'PROMPT_INJECTION_DEFENSE' 
    | 'COGNITO_LOGIN' 
    | 'DOCUMENT_APPROVED' 
    | 'DOCUMENT_REJECTED' 
    | 'TICKET_CREATED' 
    | 'TICKET_RESOLVED'
    | 'LEAVE_REQUESTED'
    | 'LEAVE_APPROVED'
    | 'EXPENSE_SUBMITTED'
    | 'EXPENSE_APPROVED'
    | 'ACCESS_PROVISIONED'
    | 'POLICY_ACKNOWLEDGED';
  resource: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details: string;
  ipAddress: string;
  awsService: 'Bedrock' | 'S3' | 'Cognito' | 'Lambda' | 'WAF' | 'API Gateway' | 'DynamoDB' | 'SES';
}

export interface SystemHealthStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs: number;
  uptime: string;
  region: string;
  details: string;
}

export interface AdminMetrics {
  totalQueriesToday: number;
  activeUsers24h: number;
  totalIndexedDocuments: number;
  pendingApprovalsCount: number;
  openTicketsCount: number;
  pendingLeavesCount?: number;
  pendingExpensesCount?: number;
  avgRagLatencyMs: number;
  kbSyncStatus: 'AVAILABLE' | 'SYNCING' | 'FAILED';
  lastSyncTimestamp: string;
  dlqDeadLetterCount: number;
  bedrockTokensToday: number;
  monthlyEstimatedCostInr: number;
  monthlyEstimatedCostUsd?: number;
  departmentQueryDistribution: Record<Department, number>;
  queriesTimeline: { time: string; count: number }[];
}

// ==========================================
// WORKPLACE MANAGEMENT EXPANSION TYPES
// ==========================================

export type LeaveType = 
  | 'VACATION' 
  | 'SICK_LEAVE' 
  | 'PARENTAL' 
  | 'BEREAVEMENT' 
  | 'FLOATING_HOLIDAY' 
  | 'REMOTE_WORK_EXCEPTION';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNotes?: string;
  policyCitation: string;
}

export interface PtoBalance {
  employeeId: string;
  vacationDaysTotal: number;
  vacationDaysUsed: number;
  sickDaysTotal: number;
  sickDaysUsed: number;
  parentalWeeksTotal: number;
  floatingHolidaysRemaining: number;
  remoteDaysAllowanceMonthly: number;
}

export interface ItAsset {
  id: string;
  assetTag: string;
  deviceModel: string;
  category: 'LAPTOP' | 'MONITOR' | 'SECURITY_KEY' | 'ACCESSORY' | 'CLOUD_WORKSTATION';
  serialNumber: string;
  assignedTo: string;
  assignedEmail: string;
  assignedDate: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'UPGRADE_ELIGIBLE' | 'DECOMMISSIONED';
  specifications: string;
}

export interface AccessRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: Department;
  systemName: 'AWS_IAM_ROLE' | 'PROD_BASTION_SSH' | 'WORKDAY_HRIS' | 'GITHUB_ENTERPRISE' | 'JIRA_CONFLUENCE';
  roleRequested: string;
  justification: string;
  durationDays: number;
  status: 'PENDING' | 'PROVISIONED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  reviewedBy?: string;
  provisionedAt?: string;
  expiryDate?: string;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: Department;
  category: 
    | 'DOMESTIC_MEAL' 
    | 'HOTEL_LODGING' 
    | 'INTERNET_STIPEND' 
    | 'HOME_OFFICE_SETUP' 
    | 'AIRFARE_TRAVEL' 
    | 'TRAINING_CERTIFICATION'
    | 'CLIENT_ENTERTAINMENT';
  amount: number;
  currency: string;
  dateIncurred: string;
  merchant: string;
  description: string;
  receiptS3Key?: string;
  complianceStatus: 'COMPLIANT' | 'POLICY_EXCEPTION_REQUIRES_VP' | 'REJECTED';
  status: 'SUBMITTED' | 'APPROVED' | 'REIMBURSED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  policyLimitNote: string;
}

export interface CorporateAnnouncement {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorRole: string;
  department: Department | 'All Departments';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  category: 'COMPANY_UPDATE' | 'POLICY_CHANGE' | 'BENEFITS_ENROLLMENT' | 'SECURITY_ALERT' | 'TOWN_HALL';
  publishedAt: string;
  pinned: boolean;
  mandatoryAck: boolean;
  readCount: number;
  tags: string[];
}

export interface PolicyAcknowledgment {
  id: string;
  policyDocId: string;
  policyTitle: string;
  employeeEmail: string;
  employeeName: string;
  department: Department;
  acknowledgedAt: string;
  version: string;
}

export interface OrgEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  title: string;
  managerName: string;
  location: string;
  avatar: string;
  phone: string;
  skills: string[];
  clearance: Classification[];
}
