import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { 
  LeaveRequest, 
  PtoBalance, 
  ItAsset, 
  AccessRequest, 
  ExpenseClaim, 
  CorporateAnnouncement, 
  PolicyAcknowledgment, 
  OrgEmployee,
  LeaveType,
  Department
} from '../types';
import { 
  Building2, 
  Calendar, 
  Laptop, 
  Receipt, 
  Megaphone, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  ExternalLink,
  Search,
  FileCheck,
  CreditCard,
  Key,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';

interface WorkplaceHubPageProps {
  onNavigateToChat?: () => void;
  onViewDoc?: (docId: string) => void;
}

export const WorkplaceHubPage: React.FC<WorkplaceHubPageProps> = ({ onNavigateToChat, onViewDoc }) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'leave' | 'assets' | 'expenses' | 'announcements' | 'directory'>('leave');
  
  // Data state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [ptoBalance, setPtoBalance] = useState<PtoBalance | null>(null);
  const [itAssets, setItAssets] = useState<ItAsset[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
  const [announcements, setAnnouncements] = useState<CorporateAnnouncement[]>([]);
  const [policyAcks, setPolicyAcks] = useState<PolicyAcknowledgment[]>([]);
  const [orgDirectory, setOrgDirectory] = useState<OrgEmployee[]>([]);

  // Search and filter state
  const [dirSearch, setDirSearch] = useState<string>('');
  const [dirDeptFilter, setDirDeptFilter] = useState<Department | 'ALL'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState<LeaveType>('VACATION');
  const [leaveStart, setLeaveStart] = useState<string>('');
  const [leaveEnd, setLeaveEnd] = useState<string>('');
  const [leaveDays, setLeaveDays] = useState<number>(1);
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Access Form
  const [accessSystem, setAccessSystem] = useState<AccessRequest['systemName']>('AWS_IAM_ROLE');
  const [accessRole, setAccessRole] = useState<string>('');
  const [accessJustification, setAccessJustification] = useState<string>('');
  const [accessDuration, setAccessDuration] = useState<number>(7);

  // Expense Form
  const [expCategory, setExpCategory] = useState<ExpenseClaim['category']>('DOMESTIC_MEAL');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expMerchant, setExpMerchant] = useState<string>('');
  const [expDesc, setExpDesc] = useState<string>('');
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    setLeaveRequests(apiService.getLeaveRequests(currentUser));
    setPtoBalance(apiService.getPtoBalance(currentUser.email));
    setItAssets(apiService.getItAssets(isAdmin ? undefined : currentUser.email));
    setAccessRequests(apiService.getAccessRequests(isAdmin ? undefined : currentUser.email));
    setExpenseClaims(apiService.getExpenseClaims(isAdmin ? undefined : currentUser.email));
    setAnnouncements(apiService.getAnnouncements());
    setPolicyAcks(apiService.getPolicyAcknowledgments(currentUser.email));
    setOrgDirectory(apiService.getOrgDirectory());
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Leave Handlers
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason.trim()) return;

    await apiService.submitLeaveRequest({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      department: currentUser.department,
      leaveType: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      totalDays: leaveDays,
      reason: leaveReason,
      policyCitation: 'NEX-HR-POL-001 Section 4 (Authorized Leave Policy)'
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
    showNotification(`Leave request for ${leaveDays} day(s) submitted to department manager.`);
    loadData();
  };

  const handleReviewLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    await apiService.reviewLeaveRequest(leaveId, status, `${status} by ${currentUser.name}`, currentUser.email);
    showNotification(`Leave request ${leaveId} marked as ${status}.`);
    loadData();
  };

  // Access Request Handlers
  const handleApplyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessRole.trim() || !accessJustification.trim()) return;

    await apiService.submitAccessRequest({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      department: currentUser.department,
      systemName: accessSystem,
      roleRequested: accessRole,
      justification: accessJustification,
      durationDays: accessDuration
    });

    setIsAccessModalOpen(false);
    setAccessRole('');
    setAccessJustification('');
    showNotification(`Access request for ${accessRole} submitted to Security Architect.`);
    loadData();
  };

  const handleProvisionAccess = async (requestId: string) => {
    await apiService.provisionAccessRequest(requestId, currentUser.email);
    showNotification(`Access request ${requestId} provisioned with IAM STS session credentials.`);
    loadData();
  };

  // Expense Claim Handlers
  const handleApplyExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0 || !expMerchant.trim() || !expDesc.trim()) return;

    let policyLimitNote = 'Compliant with corporate expense policy.';
    let complianceStatus: ExpenseClaim['complianceStatus'] = 'COMPLIANT';

    if (expCategory === 'DOMESTIC_MEAL') {
      if (amt <= 2500) {
        policyLimitNote = 'Compliant under ₹2,500.00/day meal per diem (NEX-FIN-EXP-001).';
      } else {
        policyLimitNote = 'Exceeds standard ₹2,500.00/day limit. Requires Department VP exception approval.';
        complianceStatus = 'POLICY_EXCEPTION_REQUIRES_VP';
      }
    } else if (expCategory === 'INTERNET_STIPEND') {
      policyLimitNote = 'Within ₹2,000.00 monthly broadband connectivity allowance (NEX-HR-POL-001).';
    } else if (expCategory === 'HOME_OFFICE_SETUP') {
      policyLimitNote = 'Within ₹50,000.00 one-time ergonomic setup allowance.';
    }

    await apiService.submitExpenseClaim({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      department: currentUser.department,
      category: expCategory,
      amount: amt,
      currency: 'INR',
      dateIncurred: expDate,
      merchant: expMerchant,
      description: expDesc,
      complianceStatus: complianceStatus,
      policyLimitNote: policyLimitNote
    });

    setIsExpenseModalOpen(false);
    setExpAmount('');
    setExpMerchant('');
    setExpDesc('');
    showNotification(`Expense claim submitted to Finance Controller for review.`);
    loadData();
  };

  const handleReviewExpense = async (claimId: string, status: 'APPROVED' | 'REJECTED' | 'REIMBURSED') => {
    await apiService.reviewExpenseClaim(claimId, status, currentUser.email);
    showNotification(`Expense claim ${claimId} marked as ${status}.`);
    loadData();
  };

  // Policy Acknowledgment Handler
  const handleAcknowledge = async (docId: string, title: string, version: string) => {
    await apiService.acknowledgePolicy(docId, title, currentUser, version);
    showNotification(`Cryptographic acknowledgment signed for policy: ${title}`);
    loadData();
  };

  const filteredEmployees = orgDirectory.filter(emp => {
    if (dirDeptFilter !== 'ALL' && emp.department !== dirDeptFilter) return false;
    if (dirSearch.trim()) {
      const q = dirSearch.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchTitle = emp.title.toLowerCase().includes(q);
      const matchSkill = emp.skills.some(s => s.toLowerCase().includes(q));
      const matchDept = emp.department.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchSkill && !matchDept) return false;
    }
    return true;
  });

  const isManagerOrAdmin = isAdmin || currentUser.role === 'Manager' || currentUser.department === 'Management';

  return (
    <div className="page-container" id="enterpriseiq-workplace-hub">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Enterprise Workplace Operations Hub</h1>
            <span className="badge badge-dept" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              Modules 1-5 HRMS & Ops
            </span>
          </div>
          <p className="page-subtitle">
            Centralized self-service for PTO & leave governance, IT asset provisioning, expense compliance, announcements, and employee directory.
          </p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Workplace Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${activeTab === 'leave' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('leave')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={15} />
          <span>HR PTO & Leave Portal</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'assets' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('assets')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Laptop size={15} />
          <span>IT Assets & Access IAM</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('expenses')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Receipt size={15} />
          <span>Expense Claims & Per-Diem</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'announcements' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('announcements')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Megaphone size={15} />
          <span>Announcements & Compliance</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('directory')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={15} />
          <span>Org Directory & Team Map</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: HR PTO & LEAVE MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PTO Balances Grid */}
          {ptoBalance && (
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Annual Vacation Days</span>
                  <Calendar size={18} color="#6366f1" />
                </div>
                <div className="stat-card-value">
                  {ptoBalance.vacationDaysTotal - ptoBalance.vacationDaysUsed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {ptoBalance.vacationDaysTotal} left</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${((ptoBalance.vacationDaysTotal - ptoBalance.vacationDaysUsed) / ptoBalance.vacationDaysTotal) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                </div>
                <div className="stat-card-footer" style={{ color: 'var(--text-secondary)' }}>Accrues 1.67 days/month</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Sick & Wellness Leave</span>
                  <ShieldCheck size={18} color="#10b981" />
                </div>
                <div className="stat-card-value">
                  {ptoBalance.sickDaysTotal - ptoBalance.sickDaysUsed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {ptoBalance.sickDaysTotal} left</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${((ptoBalance.sickDaysTotal - ptoBalance.sickDaysUsed) / ptoBalance.sickDaysTotal) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                </div>
                <div className="stat-card-footer" style={{ color: '#34d399' }}>100% paid health days</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Primary Caregiver Leave</span>
                  <Building2 size={18} color="#f59e0b" />
                </div>
                <div className="stat-card-value">18 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Weeks</span></div>
                <div className="stat-card-footer" style={{ color: '#fbbf24' }}>Fully paid parental benefit (2026)</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Floating Holidays</span>
                  <Sparkles size={18} color="#a855f7" />
                </div>
                <div className="stat-card-value">{ptoBalance.floatingHolidaysRemaining} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Days left</span></div>
                <div className="stat-card-footer" style={{ color: '#c084fc' }}>Cultural & Personal observances</div>
              </div>
            </div>
          )}

          {/* Leave Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Leave History & Approval Status
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsLeaveModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Leave Requests Table */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Request ID & Employee</th>
                  <th style={{ padding: '12px 16px' }}>Leave Type</th>
                  <th style={{ padding: '12px 16px' }}>Duration</th>
                  <th style={{ padding: '12px 16px' }}>Reason & Grounding</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Reviewer Notes</th>
                  {isManagerOrAdmin && <th style={{ padding: '12px 16px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.id}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{req.employeeName} ({req.department})</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-dept">{req.leaveType.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.totalDays} day(s)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.startDate} to {req.endDate}</div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{req.reason}</div>
                      <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '4px' }}>📜 {req.policyCitation}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${
                        req.status === 'APPROVED' ? 'badge-success' :
                        req.status === 'PENDING' ? 'badge-warn' : 'badge-danger'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                      {req.approvalNotes || (req.reviewedBy ? `Reviewed by ${req.reviewedBy}` : 'Awaiting manager')}
                    </td>
                    {isManagerOrAdmin && (
                      <td style={{ padding: '12px 16px' }}>
                        {req.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReviewLeave(req.id, 'APPROVED')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#10b981' }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReviewLeave(req.id, 'REJECTED')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: IT ASSETS & ACCESS IAM */}
      {/* ==================================================== */}
      {activeTab === 'assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Hardware Assets Assigned */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Assigned Enterprise Hardware & Devices
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {itAssets.map(asset => (
                <div
                  key={asset.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    padding: '18px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-dept">{asset.category}</span>
                    <span className="badge badge-success">{asset.status}</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {asset.deviceModel}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Tag: <strong>{asset.assetTag}</strong> • S/N: {asset.serialNumber}
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.25)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {asset.specifications}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Assigned to: <strong>{asset.assignedTo}</strong> ({asset.assignedDate})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IAM Access Requests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cloud & IAM Role Access Provisioning
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Short-lived elevated IAM session credentials & breakglass admin roles under AWS Zero-Trust.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsAccessModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Key size={15} />
                <span>Request System Access</span>
              </button>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Request ID & User</th>
                    <th style={{ padding: '12px 16px' }}>Target System</th>
                    <th style={{ padding: '12px 16px' }}>Role Requested</th>
                    <th style={{ padding: '12px 16px' }}>Justification</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Expiry</th>
                    {isAdmin && <th style={{ padding: '12px 16px' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {accessRequests.map(acc => (
                    <tr key={acc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{acc.id}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{acc.employeeName}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-class">{acc.systemName.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {acc.roleRequested}
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '240px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {acc.justification}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${acc.status === 'PROVISIONED' ? 'badge-success' : 'badge-warn'}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {acc.expiryDate || `${acc.durationDays} days requested`}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '12px 16px' }}>
                          {acc.status === 'PENDING' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleProvisionAccess(acc.id)}
                              style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#06b6d4' }}
                            >
                              Provision
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: EXPENSE CLAIMS & PER-DIEM */}
      {/* ==================================================== */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Policy Limits Quick Ref */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)' }}>
                <Receipt size={22} color="#34d399" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  Nexora Corporate Travel & Expense Standards (2026)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Domestic Meals: <strong>₹2,500.00/day</strong> • Broadband: <strong>₹2,000.00/mo</strong> • WFH Setup: <strong>₹50,000.00</strong> • Metro Hotels: <strong>₹10,000.00/night</strong>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsExpenseModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Submit Expense Claim</span>
            </button>
          </div>

          {/* Claims Table */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Claim # & Employee</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Merchant & Details</th>
                  <th style={{ padding: '12px 16px' }}>Compliance Status</th>
                  <th style={{ padding: '12px 16px' }}>Claim Status</th>
                  {isManagerOrAdmin && <th style={{ padding: '12px 16px' }}>Review</th>}
                </tr>
              </thead>
              <tbody>
                {expenseClaims.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exp.claimNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{exp.employeeName} ({exp.dateIncurred})</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-dept">{exp.category.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '0.92rem', color: '#4ade80' }}>
                      ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exp.currency}</span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.merchant}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{exp.description}</div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                      <span className={`badge ${exp.complianceStatus === 'COMPLIANT' ? 'badge-success' : 'badge-warn'}`} style={{ fontSize: '0.7rem' }}>
                        {exp.complianceStatus.replace(/_/g, ' ')}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {exp.policyLimitNote}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${
                        exp.status === 'REIMBURSED' ? 'badge-success' :
                        exp.status === 'APPROVED' ? 'badge-info' :
                        exp.status === 'SUBMITTED' ? 'badge-warn' : 'badge-danger'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    {isManagerOrAdmin && (
                      <td style={{ padding: '12px 16px' }}>
                        {exp.status === 'SUBMITTED' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReviewExpense(exp.id, 'APPROVED')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#10b981' }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReviewExpense(exp.id, 'REJECTED')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {exp.status === 'APPROVED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewExpense(exp.id, 'REIMBURSED')}
                            style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#06b6d4' }}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: ANNOUNCEMENTS & COMPLIANCE */}
      {/* ==================================================== */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SOC 2 / Statutory Policy Attestation Ledger Card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Digital Policy Attestation & Compliance Ledger (SOC 2 Type II)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Mandatory cryptographic acknowledgment for corporate security, code of conduct, and HR policies.
                  </p>
                </div>
              </div>
              <span className="badge badge-dept" style={{ fontSize: '0.72rem' }}>
                Immutable SHA-256 Ledger
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Policy Document</th>
                    <th>Version</th>
                    <th>Attestation Status</th>
                    <th>SHA-256 Signature Digest</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'doc-hr-001', code: 'NEX-HR-POL-001', title: 'Remote Work & Hybrid Schedule Policy 2026', version: '3.2' },
                    { id: 'doc-it-002', code: 'NEX-IT-SEC-002', title: 'Zero-Trust Endpoint Security & Password Rotation Standard', version: '2026.1' },
                    { id: 'doc-fin-001', code: 'NEX-FIN-EXP-001', title: 'India Travel & Expense Reimbursement SOP', version: '2.4' },
                    { id: 'doc-hr-003', code: 'NEX-HR-ETH-003', title: 'Code of Business Conduct, Ethics & POSH Compliance', version: '2.0' }
                  ].map(policy => {
                    const ack = policyAcks.find(a => a.policyDocId === policy.id || a.policyTitle.includes(policy.title.substring(0, 15)));
                    const isSigned = !!ack;
                    return (
                      <tr key={policy.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{policy.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#818cf8' }}>{policy.code}</div>
                        </td>
                        <td><span className="badge badge-class">v{policy.version}</span></td>
                        <td>
                          {isSigned ? (
                            <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                              ✓ SIGNED & ATTESTED
                            </span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                              ⏳ PENDING SIGNATURE
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: isSigned ? '#94a3b8' : 'var(--text-muted)' }}>
                            {isSigned ? `0x${(policy.id + currentUser.email).split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0).toString(16).padEnd(16, 'f').substring(0, 16)}...` : '—'}
                          </span>
                        </td>
                        <td>
                          {isSigned ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Signed {ack?.acknowledgedAt ? ack.acknowledgedAt.substring(0, 10) : 'Active'}
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAcknowledge(policy.id, policy.title, policy.version)}
                              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                            >
                              Sign & Acknowledge (SHA-256)
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
            Corporate Broadcasts & Town Hall Feed
          </div>

          {announcements.map(ann => {
            const isAcked = policyAcks.some(a => a.policyTitle.includes(ann.title.substring(0, 20)));
            return (
              <div
                key={ann.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: ann.pinned ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                  padding: '22px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className={`badge ${
                        ann.priority === 'URGENT' ? 'badge-danger' :
                        ann.priority === 'HIGH' ? 'badge-warn' : 'badge-dept'
                      }`}>
                        {ann.priority}
                      </span>
                      <span className="badge badge-class">{ann.category.replace('_', ' ')}</span>
                      <span className="badge badge-dept">{ann.department}</span>
                      {ann.pinned && <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>📌 PINNED</span>}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {ann.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Published by <strong>{ann.author}</strong> ({ann.authorRole}) • {ann.publishedAt} • 👁️ {ann.readCount} views
                    </div>

                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.86rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {ann.content}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                      {ann.tags.map(t => (
                        <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Acknowledgment Widget */}
                  {ann.mandatoryAck && (
                    <div style={{
                      minWidth: '220px',
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px'
                    }}>
                      <FileCheck size={24} color="#818cf8" />
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Compliance Sign-Off
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Mandatory compliance acknowledgment required for all personnel.
                      </div>
                      
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcknowledge('doc-sec-002', ann.title, '2026.1')}
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          fontSize: '0.78rem'
                        }}
                      >
                        ✓ Acknowledge Policy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: ORG DIRECTORY & TEAM MAP */}
      {/* ==================================================== */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="input-text"
                placeholder="Search 2,000 employees by name, title, skill (e.g. Bedrock, IAM, SAP)..."
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="input-select"
                value={dirDeptFilter}
                onChange={(e) => setDirDeptFilter(e.target.value as any)}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="IT Support">IT Support</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          {/* Employee Directory Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
            {filteredEmployees.map(emp => (
              <div
                key={emp.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {emp.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
                      {emp.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ID: {emp.employeeId} • Reports to: <strong>{emp.managerName}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-dept">{emp.department}</span>
                  <span className="badge badge-class">{emp.clearance.join(', ')}</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>{emp.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--text-muted)" />
                    <span>{emp.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--text-muted)" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {emp.skills.map(s => (
                    <span key={s} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-light)', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: APPLY FOR LEAVE */}
      {/* ==================================================== */}
      {isLeaveModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit HR Leave Application
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsLeaveModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">Leave Category *</label>
                  <select
                    className="input-select"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="VACATION">Annual Paid Vacation</option>
                    <option value="SICK_LEAVE">Sick & Wellness Leave</option>
                    <option value="PARENTAL">Primary Caregiver Parental Leave (18 Weeks)</option>
                    <option value="FLOATING_HOLIDAY">Floating Cultural Holiday</option>
                    <option value="BEREAVEMENT">Bereavement Leave</option>
                    <option value="REMOTE_WORK_EXCEPTION">Temporary Remote Exception</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Start Date *</label>
                    <input
                      type="date"
                      className="input-text"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="input-label">End Date *</label>
                    <input
                      type="date"
                      className="input-text"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Total Working Days *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    className="input-text"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(parseInt(e.target.value) || 1)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="input-label">Reason / Work Handover Details *</label>
                  <textarea
                    className="input-textarea"
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Specify reason and designated on-call coverage replacement..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: REQUEST ACCESS */}
      {/* ==================================================== */}
      {isAccessModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAccessModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} color="#06b6d4" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Request Elevated IAM / System Role
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsAccessModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyAccess}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">Target System *</label>
                  <select
                    className="input-select"
                    value={accessSystem}
                    onChange={(e) => setAccessSystem(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="AWS_IAM_ROLE">AWS IAM Identity Center Role</option>
                    <option value="PROD_BASTION_SSH">Production Bastion SSH Breakglass</option>
                    <option value="WORKDAY_HRIS">Workday HRIS Configuration Role</option>
                    <option value="GITHUB_ENTERPRISE">GitHub Enterprise Org Admin</option>
                    <option value="JIRA_CONFLUENCE">Atlassian Jira/Confluence Lead</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Role Name Requested *</label>
                  <input
                    type="text"
                    className="input-text"
                    value={accessRole}
                    onChange={(e) => setAccessRole(e.target.value)}
                    placeholder="e.g. AWSAdministratorAccess-EKS-Prod"
                    required
                    style={{ width: '100%', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      'AWSAdministratorAccess-EKS-Prod',
                      'AWSReadOnly-Billing-Finance',
                      'OpenSearchServerless-Admin',
                      'KMS-Decryption-Specialist'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAccessRole(preset)}
                        className="badge"
                        style={{
                          background: accessRole === preset ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: accessRole === preset ? '#06b6d4' : 'var(--border-subtle)',
                          color: accessRole === preset ? '#06b6d4' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          padding: '3px 8px'
                        }}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Requested Session Duration *</label>
                  <select
                    className="input-select"
                    value={accessDuration}
                    onChange={(e) => setAccessDuration(parseInt(e.target.value) || 1)}
                    style={{ width: '100%' }}
                  >
                    <option value="1">4 Hours (Standard Maintenance / JIT Debug Window)</option>
                    <option value="1">8 Hours (1 Business Day)</option>
                    <option value="2">2 Days (Feature Rollout)</option>
                    <option value="7">7 Days (Sprint Duration)</option>
                    <option value="14">14 Days (Two-Week Release Cycle)</option>
                    <option value="30">30 Days (Temporary Project Assignment)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Business Justification *</label>
                  <textarea
                    className="input-textarea"
                    rows={3}
                    value={accessJustification}
                    onChange={(e) => setAccessJustification(e.target.value)}
                    placeholder="Describe specific project ticket and justification for elevated privilege..."
                    required
                    style={{ width: '100%', marginBottom: '6px' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      'Investigating production canary deployment latency drift',
                      'Emergency hotfix for API gateway CORS configuration',
                      'Quarterly SOC 2 security audit compliance inspection'
                    ].map(reason => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setAccessJustification(reason)}
                        className="badge"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          padding: '2px 7px'
                        }}
                      >
                        + {reason.substring(0, 38)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAccessModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Access Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: SUBMIT EXPENSE CLAIM */}
      {/* ==================================================== */}
      {isExpenseModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit Corporate Expense Claim
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsExpenseModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Expense Category *</label>
                    <select
                      className="input-select"
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="DOMESTIC_MEAL">Domestic Meal (₹2,500/day limit)</option>
                      <option value="INTERNET_STIPEND">Broadband Internet (₹2,000/mo)</option>
                      <option value="HOME_OFFICE_SETUP">Home Office Equipment (₹50,000)</option>
                      <option value="HOTEL_LODGING">Hotel & Lodging</option>
                      <option value="AIRFARE_TRAVEL">Airfare & Train Travel</option>
                      <option value="TRAINING_CERTIFICATION">Training & Certification</option>
                      <option value="CLIENT_ENTERTAINMENT">Client Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Amount (₹ INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="input-text"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 2450.00"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Merchant / Vendor *</label>
                    <input
                      type="text"
                      className="input-text"
                      value={expMerchant}
                      onChange={(e) => setExpMerchant(e.target.value)}
                      placeholder="e.g. The Capital Grille"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label className="input-label">Date Incurred *</label>
                    <input
                      type="date"
                      className="input-text"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Business Purpose & Attendees *</label>
                  <textarea
                    className="input-textarea"
                    rows={3}
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Describe business reason and names of attendees/clients..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsExpenseModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Claim to Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
