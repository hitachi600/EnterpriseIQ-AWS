import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { DocumentApproval, Department } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Filter, 
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface ApprovalsPageProps {
  onViewDocument?: (docId: string) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ onViewDocument }) => {
  const { currentUser, isAdmin } = useAuth();
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [reviewingApproval, setReviewingApproval] = useState<DocumentApproval | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = () => {
    const list = apiService.getApprovals();
    setApprovals(list);
  };

  const isManagerOrAdmin = isAdmin || currentUser.role === 'Manager' || currentUser.department === 'Management';

  const filteredApprovals = approvals.filter(item => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (selectedDept !== 'ALL' && item.department !== selectedDept) return false;
    // Non-admins only see their department's approvals unless in Management
    if (!isAdmin && currentUser.department !== 'Management' && item.department !== currentUser.department) {
      return false;
    }
    return true;
  });

  const handleApprove = async (approval: DocumentApproval) => {
    setIsProcessing(true);
    await apiService.approveDocument(approval.id, currentUser.email, reviewNotes);
    setIsProcessing(false);
    setReviewingApproval(null);
    setReviewNotes('');
    setActionSuccess(`Document "${approval.documentTitle}" approved and promoted to production Knowledge Base!`);
    loadApprovals();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = async (approval: DocumentApproval) => {
    if (!reviewNotes.trim()) {
      alert('Please provide a review note explaining the rejection reason.');
      return;
    }
    setIsProcessing(true);
    await apiService.rejectDocument(approval.id, currentUser.email, reviewNotes);
    setIsProcessing(false);
    setReviewingApproval(null);
    setReviewNotes('');
    setActionSuccess(`Document "${approval.documentTitle}" rejected with feedback.`);
    loadApprovals();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="page-container" id="enterpriseiq-approvals-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Document Governance & Approval Queue</h1>
            <span className="badge badge-dept" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
              Module 11
            </span>
          </div>
          <p className="page-subtitle">
            Enterprise staging quarantine and compliance review before knowledge base vectorization.
          </p>
        </div>
      </div>

      {/* Corporate Workflow Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)' }}>
            <ShieldCheck size={22} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Zero-Trust Document Ingestion Policy
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Uploaded corporate runbooks are quarantined in S3 staging. Only approved documents trigger Amazon Bedrock chunking and OpenSearch indexing.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}>1. Staging S3</span>
          <ArrowRight size={14} />
          <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}>2. Manager Review</span>
          <ArrowRight size={14} />
          <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontWeight: 600 }}>3. Production KB</span>
        </div>
      </div>

      {/* Alert Notification */}
      {actionSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`btn btn-sm ${selectedStatus === st ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {st === 'ALL' ? 'All Reviews' : st}
              {st === 'PENDING' && (
                <span style={{
                  marginLeft: '6px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: 'rgba(234, 179, 8, 0.3)',
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {approvals.filter(a => a.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Department Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            className="input-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as any)}
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

      {/* Approvals Grid */}
      {filteredApprovals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px dashed var(--border-subtle)'
        }}>
          <CheckCircle2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No pending reviews found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            All staged enterprise documentation in this category is currently up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredApprovals.map(item => {
            const isPending = item.status === 'PENDING';
            return (
              <div 
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: isPending ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-subtle)',
                  padding: '20px',
                  boxShadow: isPending ? '0 4px 20px rgba(234, 179, 8, 0.05)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span className={`badge ${
                        item.status === 'PENDING' ? 'badge-warn' :
                        item.status === 'APPROVED' ? 'badge-success' : 'badge-danger'
                      }`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.status === 'PENDING' && <Clock size={12} />}
                        {item.status === 'APPROVED' && <CheckCircle2 size={12} />}
                        {item.status === 'REJECTED' && <XCircle size={12} />}
                        {item.status}
                      </span>
                      <span className="badge badge-dept">{item.department}</span>
                      <span className="badge badge-class">{item.classification}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>v{item.version}</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {item.documentTitle}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span><strong>File:</strong> {item.fileName}</span>
                      <span><strong>Submitted By:</strong> {item.submittedBy}</span>
                      <span><strong>Date:</strong> {item.submittedAt}</span>
                    </div>

                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Diff Summary / Proposed Changes:</strong>
                      <p style={{ marginTop: '4px', lineHeight: 1.5 }}>{item.diffSummary}</p>
                    </div>

                    {item.reviewNotes && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: item.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        fontSize: '0.82rem',
                        color: item.status === 'APPROVED' ? '#4ade80' : '#f87171'
                      }}>
                        <strong>Reviewer Note ({item.reviewedBy}):</strong> {item.reviewNotes}
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                    {onViewDocument && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewDocument(item.documentId)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <FileText size={14} />
                        <span>Inspect Draft</span>
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setReviewingApproval(item)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <UserCheck size={14} />
                          <span>Review & Approve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Decision Modal */}
      {reviewingApproval && (
        <div className="modal-backdrop" onClick={() => setReviewingApproval(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Compliance & Promotion Decision
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setReviewingApproval(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOCUMENT TO INDEX</label>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {reviewingApproval.documentTitle}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Department: <strong>{reviewingApproval.department}</strong> • Clearance: <strong>{reviewingApproval.classification}</strong> • Version: <strong>{reviewingApproval.version}</strong>
                </div>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                fontSize: '0.82rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Automated Security Verification:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={13} /> S3 Malware & Antivirus Screening: PASS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '0.78rem', marginTop: '2px' }}>
                  <CheckCircle2 size={13} /> AWS KMS SSE Encryption CMK: VALIDATED
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '0.78rem', marginTop: '2px' }}>
                  <CheckCircle2 size={13} /> Bedrock Sidecar Metadata Schema: COMPLIANT
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Manager Review Notes / Approval Justification:
                </label>
                <textarea
                  className="input-textarea"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g., Verified updated meal policy with finance VP. Ready for organization-wide AI indexing."
                  style={{ marginTop: '6px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button
                className="btn btn-danger"
                disabled={isProcessing}
                onClick={() => handleReject(reviewingApproval)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={16} />
                <span>Reject & Request Revision</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setReviewingApproval(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={isProcessing}
                  onClick={() => handleApprove(reviewingApproval)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isProcessing ? 'Vectorizing...' : 'Approve & Index'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
