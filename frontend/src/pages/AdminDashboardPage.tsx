import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { AdminMetrics, User } from '../types';
import { 
  Sliders, 
  RefreshCw, 
  Database, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  HardDrive
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateToAudit: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateToAudit }) => {
  const { currentUser, switchPersona, allPersonas, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>(apiService.getAdminMetrics());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; durationSec: number; indexedCount: number } | null>(null);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await apiService.triggerKnowledgeBaseSync(currentUser.email);
      setSyncResult(res);
      setMetrics(apiService.getAdminMetrics());
    } catch (err) {
      console.error('Failed to trigger KB sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getDepartmentPercentage = (deptCount: number) => {
    const total = metrics.totalQueriesToday || 1;
    return ((deptCount / total) * 100).toFixed(1);
  };

  return (
    <div className="page-container" id="admin-dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sliders size={24} color="#6366f1" />
            <span>Enterprise Admin Control Center</span>
          </h1>
          <p className="page-subtitle">
            Manage Amazon Bedrock Knowledge Bases, monitor multi-department query volume, and inspect SQS ingestion health.
          </p>
        </div>

        {/* Sync Trigger */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            id="btn-sync-kb"
            className="btn btn-primary" 
            onClick={handleTriggerSync} 
            disabled={isSyncing}
            style={{ padding: '9px 18px' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin-animation' : ''} />
            <span>{isSyncing ? 'Synchronizing Vector Index...' : 'Trigger Bedrock KB Sync'}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncResult && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem', color: '#34d399' }}>
              <strong>Knowledge Base Ingestion Job Completed:</strong> {syncResult.indexedCount} documents synchronized into OpenSearch Serverless collection in {syncResult.durationSec}s.
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status: ACTIVE</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Activity size={22} />
          </div>
          <span className="stat-val">{metrics.totalQueriesToday}</span>
          <span className="stat-label">Total RAG Queries (24h)</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Users size={22} />
          </div>
          <span className="stat-val">{metrics.activeUsers24h}</span>
          <span className="stat-label">Active Employees (Cognito)</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Cpu size={22} />
          </div>
          <span className="stat-val">{(metrics.bedrockTokensToday / 1000).toFixed(1)}k</span>
          <span className="stat-label">Bedrock Tokens Consumed</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <IndianRupee size={22} />
          </div>
          <span className="stat-val">₹{(metrics.monthlyEstimatedCostInr || metrics.monthlyEstimatedCostUsd || 1248).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className="stat-label">AWS FinOps Cost (INR MTD)</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Department Query Distribution */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Query Volume by Department</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live DynamoDB Aggregation</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(metrics.departmentQueryDistribution)
              .filter(([dept]) => dept !== 'All Departments')
              .map(([dept, count]) => {
                const pct = getDepartmentPercentage(count);
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dept}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} queries ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          borderRadius: '4px', 
                          background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Knowledge Base Status & SQS Dead-Letter Monitor */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Database size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Bedrock KB & Async Queue Health</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Vector Index Status:</div>
                <div style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <CheckCircle2 size={15} /> OpenSearch Serverless (AVAILABLE)
                </div>
              </div>
              <span className="badge badge-dept">1024-dim Titan V2</span>
            </div>

            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Knowledge Base Sync:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {metrics.lastSyncTimestamp}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: SYNCED</span>
            </div>

            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>SQS Ingestion Dead-Letter Queue (DLQ):</div>
                <div style={{ fontWeight: 700, color: metrics.dlqDeadLetterCount === 0 ? '#34d399' : '#f87171', marginTop: '2px' }}>
                  {metrics.dlqDeadLetterCount} Failed Messages in DLQ
                </div>
              </div>
              <span className="badge badge-success">0 Errors</span>
            </div>
          </div>
        </div>
      </div>

      {/* CloudWatch Telemetry & Performance Gauges */}
      <div className="glass-card" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#6366f1" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AWS CloudWatch Live Telemetry & Latency Profiling</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Real-time metrics sampled across Amazon Bedrock, API Gateway, and DynamoDB single-table store.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Live Telemetry Active</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>API Gateway Latency (P50)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>142 ms</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>↓ 12ms vs 24h baseline</div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RAG Pipeline Latency (P95)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>285 ms</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Within 500ms target SLA</div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DynamoDB Consumed Capacity</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>4.8 WCU / 12 RCU</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>On-Demand Auto-scaling</div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CloudWatch Metric Alarms</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>0 In Alarm</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>6 Alarms OK (Green)</div>
          </div>
        </div>

        {/* Live CloudWatch Log Streams */}
        <div style={{
          background: 'rgba(10, 15, 29, 0.9)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              LOG_STREAM: /aws/bedrock/rag-pipeline-query-engine [us-east-1]
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Auto-refreshing every 5s</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            lineHeight: 1.5
          }}>
            <div><span style={{ color: '#64748b' }}>[2026-10-08 13:45:01 UTC]</span> <span style={{ color: '#38bdf8' }}>INFO</span> [BedrockRagService] Ingested Titan V2 vector embedding for query: "Kubernetes Canary..." [384 dims]</div>
            <div><span style={{ color: '#64748b' }}>[2026-10-08 13:45:02 UTC]</span> <span style={{ color: '#34d399' }}>OK</span> [RBACFilter] Applied department scope: Engineering + PUBLIC_INTERNAL (0 restricted chunks pruned)</div>
            <div><span style={{ color: '#64748b' }}>[2026-10-08 13:45:02 UTC]</span> <span style={{ color: '#38bdf8' }}>INFO</span> [Claude3.5Sonnet] Invoked model anthropic.claude-3-5-sonnet-20241022-v2:0 (Prompt: 184 tokens, Completion: 142 tokens)</div>
            <div><span style={{ color: '#64748b' }}>[2026-10-08 13:45:03 UTC]</span> <span style={{ color: '#10b981' }}>SUCCESS</span> [CloudTrail] Emitted AuditEvent: QUERY_KNOWLEDGE_BASE (Actor: alex.chen@nexora.internal, Status: SUCCESS)</div>
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cognito User Pool RBAC Directory</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{allPersonas.length} Registered Enterprise Users</span>
        </div>

        <div className="enterprise-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Cognito Groups</th>
                <th>Max Clearance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPersonas.map((u: User) => {
                const isActive = u.id === currentUser.id;
                return (
                  <tr key={u.id} style={{ background: isActive ? 'rgba(99, 102, 241, 0.08)' : undefined }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: isActive ? '2px solid #6366f1' : '1px solid var(--border-subtle)' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-dept">{u.department}</span></td>
                    <td><span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{u.role}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {u.cognitoGroups.slice(0, 2).map((g, i) => (
                          <span key={i} style={{ fontSize: '0.72rem', color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-restricted" style={{ fontSize: '0.7rem' }}>
                        {u.clearanceLevel[u.clearanceLevel.length - 1]}
                      </span>
                    </td>
                    <td>
                      {isActive ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#34d399', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                          <CheckCircle2 size={13} /> Active Identity
                        </span>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 'var(--radius-full)' }}
                          onClick={() => switchPersona(u.id)}
                          title={`Assume ${u.name}'s identity and test ${u.department} access`}
                        >
                          <span>Switch to {u.name.split(' ')[0]}</span>
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
    </div>
  );
};
