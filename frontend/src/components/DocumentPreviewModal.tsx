import React from 'react';
import { DocumentItem } from '../types';
import { X, FileText, Lock, ShieldCheck, Database, HardDrive, Tag, Calendar, UserCheck } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose }) => {
  if (!document) return null;

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'RESTRICTED': return <span className="badge badge-restricted">RESTRICTED</span>;
      case 'CONFIDENTIAL': return <span className="badge badge-confidential">CONFIDENTIAL</span>;
      case 'DEPARTMENT_ONLY': return <span className="badge badge-dept">DEPARTMENT ONLY</span>;
      default: return <span className="badge badge-public">PUBLIC INTERNAL</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="doc-preview-modal-overlay">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {getClassificationBadge(document.classification)}
              <span className="badge badge-dept">{document.department}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v{document.version}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {document.title}
            </h2>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Cloud Metadata Banner */}
        <div style={{ padding: '16px 28px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={13} color="#06b6d4" /> S3 Key:
            </span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {document.s3Key}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={13} color="#f59e0b" /> KMS Encryption:
            </span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              AWS-KMS (CMK Active)
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={13} color="#a855f7" /> Vector Chunks:
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {document.chunkCount} Chunks (1024-dim)
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={13} color="#10b981" /> Uploaded By:
            </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {document.uploadedBy}
            </span>
          </div>
        </div>

        {/* Document Content Body */}
        <div style={{ padding: '24px 28px', maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText size={16} color="#6366f1" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Verified Policy Content:
            </h4>
          </div>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {document.content}
          </pre>

          {/* Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Tag size={14} color="var(--text-muted)" />
            {document.tags.map((t, idx) => (
              <span key={idx} className="badge badge-dept" style={{ fontSize: '0.72rem' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(15, 23, 42, 0.5)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
