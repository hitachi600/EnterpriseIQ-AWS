import React from 'react';
import { apiService } from '../services/apiService';
import { X, Cloud, Server, Database, Shield, Lock, Activity, CheckCircle2, Zap, Radio, Bell } from 'lucide-react';

interface CloudTopologyModalProps {
  onClose: () => void;
}

export const CloudTopologyModal: React.FC<CloudTopologyModalProps> = ({ onClose }) => {
  const healthData = apiService.getSystemHealth();

  return (
    <div className="modal-overlay" onClick={onClose} id="cloud-topology-modal-overlay">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={20} color="#6366f1" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AWS Production Architecture Topology
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time multi-tenant serverless infrastructure in region <strong style={{ color: 'var(--accent-cyan)' }}>us-east-1</strong>
            </p>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Architecture Node Map */}
        <div style={{ padding: '24px 28px', background: 'rgba(11, 17, 32, 0.9)', overflowY: 'auto', maxHeight: '70vh' }}>
          {/* Edge & Auth Layer */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Layer 1: Edge, Security & Identity
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color="#06b6d4" />
                    <strong style={{ fontSize: '0.9rem' }}>AWS WAF + CloudFront</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Active</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  OWASP Top 10 rule enforcement, IP throttling (100 req/sec), HTTPS TLS 1.3 termination.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="#f59e0b" />
                    <strong style={{ fontSize: '0.9rem' }}>Amazon Cognito</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>OAuth 2.0</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  User pool with custom claims (<code style={{ color: '#c7d2fe' }}>custom:department</code>), JWT access tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Compute & Routing Layer */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Layer 2: API Gateway & Serverless Compute
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={18} color="#6366f1" />
                    <strong style={{ fontSize: '0.9rem' }}>Amazon API Gateway</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>18ms avg</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  REST API with JWT Authorizer, request schema validation, and rate limit tiers.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#a855f7" />
                    <strong style={{ fontSize: '0.9rem' }}>AWS Lambda Backend</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>ARM64 Graviton</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Stateless micro-handlers (Query Orchestrator, Doc Manager, Ingestion Worker).
                </p>
              </div>
            </div>
          </div>

          {/* Generative AI & Vector Layer */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Layer 3: Generative AI & Knowledge Retrieval (RAG)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio size={18} color="#6366f1" />
                    <strong style={{ fontSize: '0.9rem' }}>Amazon Bedrock (Claude 3.5)</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>FM Online</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Anthropic Claude 3.5 Sonnet foundation model + Titan Text Embeddings V2 (1024-dim).
                </p>
              </div>

              <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} color="#06b6d4" />
                    <strong style={{ fontSize: '0.9rem' }}>OpenSearch Serverless</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Vector Index</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Vector similarity search with pre-retrieval SQL/metadata filter on <code style={{ color: '#67e8f9' }}>department</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Storage & Observability Layer */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Layer 4: Storage, Event Pipeline & Observability
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} color="#10b981" />
                    <strong style={{ fontSize: '0.9rem' }}>Amazon S3 + KMS</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>SSE-KMS</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Encrypted raw document vault, S3 Block Public Access, EventBridge integration.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#f59e0b" />
                    <strong style={{ fontSize: '0.9rem' }}>DynamoDB & CloudWatch</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Single-Table</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Chat history, user feedback, audit trail, structured JSON logs, X-Ray tracing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span className="pulse-indicator"></span>
            <span>All 9 Core AWS Services responding normally. Target SLA 99.95%.</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Topology
          </button>
        </div>
      </div>
    </div>
  );
};
