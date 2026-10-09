import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { SupportTicket, Department } from '../types';
import { 
  LifeBuoy, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  User, 
  MessageSquare, 
  ShieldAlert, 
  Tag, 
  FileText,
  Send,
  Sparkles
} from 'lucide-react';

interface SupportTicketsPageProps {
  onNavigateToChat?: () => void;
}

export const SupportTicketsPage: React.FC<SupportTicketsPageProps> = ({ onNavigateToChat }) => {
  const { currentUser, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New ticket form state
  const [newSubject, setNewSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('VPN_NETWORK');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [newDescription, setNewDescription] = useState<string>('');

  useEffect(() => {
    loadTickets();
  }, [currentUser]);

  const loadTickets = () => {
    const list = apiService.getTicketsForUser(currentUser);
    setTickets(list);
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  const handleResolveTicket = async (ticket: SupportTicket) => {
    if (!resolutionNote.trim()) {
      alert('Please enter resolution notes before resolving.');
      return;
    }
    await apiService.updateTicketStatus(ticket.id, 'RESOLVED', resolutionNote, currentUser.email);
    setSelectedTicket(null);
    setResolutionNote('');
    setActionMessage(`Ticket ${ticket.id} marked as RESOLVED and archived to DynamoDB state store.`);
    loadTickets();
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    await apiService.createSupportTicket({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      department: currentUser.department,
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      subject: newSubject,
      description: newDescription,
      conversationContext: 'Created via employee self-service portal.',
      assignedTo: newCategory === 'VPN_NETWORK' || newCategory === 'HARDWARE' ? 'David Kim (IT Tier 2)' : 'Alex Mercer (Admin)'
    });

    setIsCreatingModal(false);
    setNewSubject('');
    setNewDescription('');
    setActionMessage('Support ticket created successfully and routed to support queue.');
    loadTickets();
    setTimeout(() => setActionMessage(null), 4000);
  };

  const getPriorityBadgeClass = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'CRITICAL': return 'badge-danger';
      case 'HIGH': return 'badge-warn';
      case 'MEDIUM': return 'badge-info';
      case 'LOW': return 'badge-secondary';
    }
  };

  return (
    <div className="page-container" id="enterpriseiq-support-tickets-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">IT Helpdesk & Ticket Escalation</h1>
            <span className="badge badge-dept" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              Module 17
            </span>
          </div>
          <p className="page-subtitle">
            AI-to-Engineer escalation pipeline for unresolved inquiries, hardware requests, and enterprise access workflows.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsCreatingModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>New Support Request</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Open Tickets</span>
            <LifeBuoy size={18} color="#ef4444" />
          </div>
          <div className="stat-card-value">{tickets.filter(t => t.status === 'OPEN').length}</div>
          <div className="stat-card-footer" style={{ color: '#f87171' }}>Requires engineer attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">In Progress</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div className="stat-card-value">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
          <div className="stat-card-footer" style={{ color: '#fbbf24' }}>Under active investigation</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Resolved</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div className="stat-card-value">{tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</div>
          <div className="stat-card-footer" style={{ color: '#34d399' }}>SLA adherence 99.4%</div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
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
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem' }}
          >
            {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px dashed var(--border-subtle)'
        }}>
          <LifeBuoy size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No support tickets found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Employees can escalate unresolved questions directly from the AI Assistant.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredTickets.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}
              className="ticket-hover-card"
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-light)', letterSpacing: '0.02em' }}>
                    {t.id}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(t.priority)}`}>
                    {t.priority}
                  </span>
                  <span className={`badge ${
                    t.status === 'OPEN' ? 'badge-danger' :
                    t.status === 'IN_PROGRESS' ? 'badge-warn' : 'badge-success'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <span className="badge badge-dept">{t.department}</span>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {t.subject}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                  {t.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Requester: <strong>{t.employeeName}</strong></span>
                  <span>Assigned: <strong>{t.assignedTo}</strong></span>
                  <span>SLA Target: <strong>{t.slaHours}h</strong></span>
                  <span>Created: {t.createdAt}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTicket(t);
                  }}
                >
                  View Details & Context
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={20} color="#06b6d4" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Support Ticket: {selectedTicket.id}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>Priority: {selectedTicket.priority}</span>
                  <span className="badge badge-dept">{selectedTicket.department}</span>
                  <span className="badge badge-class">{selectedTicket.category}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedTicket.subject}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Submitted by {selectedTicket.employeeName} ({selectedTicket.employeeEmail}) • Assigned to: {selectedTicket.assignedTo}
                </div>
              </div>

              {/* Problem Description */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.78rem' }}>
                  PROBLEM DESCRIPTION:
                </strong>
                {selectedTicket.description}
              </div>

              {/* AI Conversation & RAG Context */}
              {selectedTicket.conversationContext && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '4px' }}>
                    <Sparkles size={14} />
                    <span>AI Assistant Grounding & Self-Service History:</span>
                  </div>
                  <p style={{ lineHeight: 1.5 }}>{selectedTicket.conversationContext}</p>
                </div>
              )}

              {/* Resolution Notes */}
              {selectedTicket.resolutionNotes ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#4ade80',
                  fontSize: '0.85rem'
                }}>
                  <strong>Resolution Notes:</strong> {selectedTicket.resolutionNotes}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Resolution Notes & Troubleshooting Action:
                  </label>
                  <textarea
                    className="input-textarea"
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="e.g. Reissued ACM VPN client certificate, verified connectivity on 10.100.0.1. Updated SOP NEX-IT-VPN-001."
                    style={{ marginTop: '6px', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>

              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleResolveTicket(selectedTicket)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark Resolved & Update SOP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create New Ticket Modal */}
      {isCreatingModal && (
        <div className="modal-backdrop" onClick={() => setIsCreatingModal(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit IT & Enterprise Support Request
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsCreatingModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">Subject / Issue Summary *</label>
                  <input
                    type="text"
                    className="input-text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. AWS Production Bastion Access Revoked"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label">Category</label>
                    <select
                      className="input-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="VPN_NETWORK">VPN & Network</option>
                      <option value="SOFTWARE_ACCESS">Software & IAM Access</option>
                      <option value="HARDWARE">Hardware & Provisioning</option>
                      <option value="PAYROLL_HR">Payroll & HR Services</option>
                      <option value="SECURITY_INCIDENT">Security & Compliance</option>
                      <option value="OTHER">General Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Priority & SLA</label>
                    <select
                      className="input-select"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="LOW">Low (24h SLA)</option>
                      <option value="MEDIUM">Medium (8h SLA)</option>
                      <option value="HIGH">High (4h SLA)</option>
                      <option value="CRITICAL">Critical (2h SLA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Detailed Description & Error Messages *</label>
                  <textarea
                    className="input-textarea"
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what troubleshooting steps were attempted and any specific AWS/system error messages..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
