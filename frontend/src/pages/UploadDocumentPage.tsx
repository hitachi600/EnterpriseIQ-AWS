import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Department, Classification } from '../types';
import { 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  ArrowRight,
  HardDrive,
  Database,
  Radio
} from 'lucide-react';

interface UploadDocumentPageProps {
  onUploadSuccess: (docId: string) => void;
}

export const UploadDocumentPage: React.FC<UploadDocumentPageProps> = ({ onUploadSuccess }) => {
  const { currentUser, isAdmin } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [department, setDepartment] = useState<Department>(
    currentUser.department === 'All Departments' ? 'Engineering' : currentUser.department
  );
  const [classification, setClassification] = useState<Classification>('DEPARTMENT_ONLY');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Policy', '2026', 'Runbook']);
  
  // Ingestion Pipeline Simulation States
  const [uploadStep, setUploadStep] = useState<number>(0); // 0: idle, 1: S3 presign, 2: S3 upload & KMS, 3: EventBridge/SQS, 4: Bedrock Ingestion, 5: complete
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadStep(1); // Step 1: Pre-signed URL generation

    await new Promise(r => setTimeout(r, 700));
    setUploadStep(2); // Step 2: S3 Upload + KMS CMK encryption

    await new Promise(r => setTimeout(r, 900));
    setUploadStep(3); // Step 3: EventBridge + SQS Ingestion Queue

    await new Promise(r => setTimeout(r, 900));
    setUploadStep(4); // Step 4: Bedrock Knowledge Base Chunking & Titan Embeddings

    const newDoc = await apiService.uploadDocument(
      selectedFile,
      department,
      classification,
      tags,
      currentUser.email
    );

    await new Promise(r => setTimeout(r, 1100));
    setCreatedDocId(newDoc.id);
    setUploadStep(5); // Ingestion Complete
    setIsProcessing(false);
  };

  return (
    <div className="page-container" id="upload-document-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UploadCloud size={24} color="#6366f1" />
            <span>Enterprise Document Ingestion</span>
          </h1>
          <p className="page-subtitle">
            Ingest PDFs, Word docs, and Runbooks into <strong style={{ color: 'var(--text-primary)' }}>Amazon Bedrock Knowledge Base</strong> with automatic vectorization.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
        {/* Upload Form Card */}
        <div className="glass-card">
          <form onSubmit={handleStartIngestion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* File Dropzone */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Select Enterprise Document (PDF, DOCX, TXT):
              </label>
              <div 
                style={{
                  border: '2px dashed rgba(99, 102, 241, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                  disabled={isProcessing}
                />
                <UploadCloud size={36} color="#6366f1" style={{ margin: '0 auto 12px' }} />
                {selectedFile ? (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for S3 ingestion
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Click or drag document file here to upload
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Supported formats: PDF, DOCX, TXT, Markdown (Max 50MB)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Target Department:
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              {/* Classification */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Access Classification:
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as Classification)}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="PUBLIC_INTERNAL">PUBLIC_INTERNAL (All Staff)</option>
                  <option value="DEPARTMENT_ONLY">DEPARTMENT_ONLY</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
              </div>
            </div>

            {/* Metadata Tags */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Search & Retrieval Metadata Tags:
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Add keyword tag (e.g., 'SOP', 'Kubernetes')..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddTag}
                  disabled={isProcessing || !tagInput.trim()}
                >
                  Add Tag
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {tags.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="badge badge-dept" 
                    style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                    onClick={() => handleRemoveTag(t)}
                    title="Click to remove tag"
                  >
                    {t} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Ingestion Trigger Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || isProcessing}
              style={{ padding: '12px', fontSize: '0.95rem', marginTop: '10px' }}
            >
              <UploadCloud size={18} />
              <span>{isProcessing ? 'Ingesting via S3 & Bedrock Pipeline...' : 'Start Secure AWS Ingestion'}</span>
            </button>
          </form>
        </div>

        {/* Real-Time AWS Pipeline Execution Tracker */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Radio size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AWS Event-Driven Ingestion Pipeline</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: uploadStep >= 1 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: uploadStep >= 1 ? '1px solid var(--primary-glow)' : '1px solid var(--border-subtle)'
            }}>
              {uploadStep > 1 ? <CheckCircle2 size={20} color="#10b981" /> : uploadStep === 1 ? <RefreshCw size={20} className="spin-animation" color="#6366f1" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: uploadStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  1. API Gateway Pre-Signed S3 URL
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Generates temporary scoped IAM credentials for secure direct upload.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: uploadStep >= 2 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: uploadStep >= 2 ? '1px solid var(--primary-glow)' : '1px solid var(--border-subtle)'
            }}>
              {uploadStep > 2 ? <CheckCircle2 size={20} color="#10b981" /> : uploadStep === 2 ? <RefreshCw size={20} className="spin-animation" color="#6366f1" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: uploadStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  2. S3 Vault Upload & KMS CMK Encryption
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Envelope encryption using Customer Managed Key (CMK) and bucket policy enforcement.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: uploadStep >= 3 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: uploadStep >= 3 ? '1px solid var(--primary-glow)' : '1px solid var(--border-subtle)'
            }}>
              {uploadStep > 3 ? <CheckCircle2 size={20} color="#10b981" /> : uploadStep === 3 ? <RefreshCw size={20} className="spin-animation" color="#6366f1" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: uploadStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  3. EventBridge $\rightarrow$ SQS Ingestion Queue
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Asynchronous event decoupling with Dead-Letter Queue (DLQ) retry protection.
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: uploadStep >= 4 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: uploadStep >= 4 ? '1px solid var(--primary-glow)' : '1px solid var(--border-subtle)'
            }}>
              {uploadStep > 4 ? <CheckCircle2 size={20} color="#10b981" /> : uploadStep === 4 ? <RefreshCw size={20} className="spin-animation" color="#6366f1" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: uploadStep >= 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  4. Bedrock Semantic Chunking & Titan Embeddings
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Generates 1024-dim normalized vector embeddings stored in OpenSearch Serverless.
                </div>
              </div>
            </div>

            {/* Complete Banner */}
            {uploadStep === 5 && (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>Document Successfully Ingested!</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Vectorized and queryable by authorized {department} employees.
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => createdDocId && onUploadSuccess(createdDocId)}
                >
                  <span>Inspect Document</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
