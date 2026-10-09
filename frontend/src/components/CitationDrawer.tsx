import React from 'react';
import { Citation } from '../types';
import { X, FileText, CheckCircle2, Shield, Database, ExternalLink, HardDrive } from 'lucide-react';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
  onViewDocument: (documentId: string) => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose, onViewDocument }) => {
  if (!citation) return null;

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'RESTRICTED': return 'badge-restricted';
      case 'CONFIDENTIAL': return 'badge-confidential';
      case 'DEPARTMENT_ONLY': return 'badge-dept';
      default: return 'badge-public';
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose} id="citation-drawer-overlay">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()} id="citation-drawer-panel">
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={13} />
                {(citation.relevanceScore * 100).toFixed(1)}% Relevance Match
              </span>
              <span className={`badge ${getClassificationColor(citation.classification)}`}>
                {citation.classification}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {citation.documentTitle}
            </h3>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* S3 URI & Metadata Bar */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <HardDrive size={15} color="#06b6d4" />
            <span>S3 Object Location:</span>
          </div>
          <code style={{ 
            background: 'rgba(0,0,0,0.4)', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '0.78rem', 
            color: '#a5b4fc',
            wordBreak: 'break-all',
            fontFamily: 'var(--font-mono)'
          }}>
            {citation.s3Uri}
          </code>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{citation.department}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Chunk Strategy:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Semantic (500 tokens)</div>
            </div>
          </div>
        </div>

        {/* Retrieved Chunk Excerpt */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <FileText size={16} color="#6366f1" />
            <span>Exact Vector Chunk Ingested by Bedrock:</span>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            borderLeft: '4px solid var(--primary)'
          }}>
            "{citation.snippet}"
          </div>
        </div>

        {/* Security & Isolation Note */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '10px'
        }}>
          <Shield size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Zero-Trust Vector Isolation:</strong>
            <p style={{ marginTop: '2px' }}>This chunk was retrieved because your Cognito identity contains clearance for department <strong>{citation.department}</strong> and classification <strong>{citation.classification}</strong>.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', paddingTop: '16px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              onViewDocument(citation.documentId);
              onClose();
            }}
          >
            <ExternalLink size={16} />
            <span>Open Full Policy Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
