import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { DocumentItem, Department, Classification } from '../types';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Lock, 
  Shield, 
  Calendar, 
  HardDrive,
  Database,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';

interface DocumentLibraryPageProps {
  onViewDocument: (docId: string) => void;
  onNavigateToUpload: () => void;
}

export const DocumentLibraryPage: React.FC<DocumentLibraryPageProps> = ({ onViewDocument, onNavigateToUpload }) => {
  const { currentUser, isAdmin } = useAuth();
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'ALL' | 'AUTHORIZED'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const fetchDocs = () => {
      const docs = apiService.getAllDocumentsForAdmin();
      setAllDocuments(docs);
    };
    fetchDocs();
  }, [currentUser]);

  const filteredDocs = allDocuments.filter(doc => {
    const hasAccess = apiService.canAccessDocument(currentUser, doc);
    if (viewScope === 'AUTHORIZED' && !hasAccess) return false;

    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
    const matchesClass = selectedClassification === 'ALL' || doc.classification === selectedClassification;
    return matchesSearch && matchesDept && matchesClass;
  });

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'RESTRICTED': return <span className="badge badge-restricted">RESTRICTED</span>;
      case 'CONFIDENTIAL': return <span className="badge badge-confidential">CONFIDENTIAL</span>;
      case 'DEPARTMENT_ONLY': return <span className="badge badge-dept">DEPARTMENT ONLY</span>;
      default: return <span className="badge badge-public">PUBLIC INTERNAL</span>;
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'Engineering': return '#6366f1';
      case 'Human Resources': return '#ec4899';
      case 'Finance': return '#10b981';
      case 'IT Support': return '#06b6d4';
      case 'Operations': return '#f59e0b';
      case 'Management': return '#a855f7';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="page-container" id="document-library-page" style={{ animation: 'modalIn 0.25s ease-out' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={20} color="#ffffff" />
            </div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              Enterprise Document Lake & Vault
            </h1>
          </div>
          <p className="page-subtitle" style={{ fontSize: '0.88rem' }}>
            S3 Document Repository with <strong>SSE-KMS encryption</strong> &middot; Showing <strong style={{ color: 'var(--primary-light)' }}>{filteredDocs.length} of {allDocuments.length} total enterprise documents</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onNavigateToUpload} style={{ boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}>
            <Sparkles size={16} />
            <span>+ Upload / Ingest Policy</span>
          </button>
        </div>
      </div>

      {/* Scope Toggles, View Toggle & Quick Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn ${viewScope === 'ALL' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px' }}
            onClick={() => setViewScope('ALL')}
          >
            <Layers size={14} />
            <span>All Enterprise Catalog ({allDocuments.length})</span>
          </button>
          <button 
            className={`btn ${viewScope === 'AUTHORIZED' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px' }}
            onClick={() => setViewScope('AUTHORIZED')}
          >
            <CheckCircle2 size={14} />
            <span>Authorized for {currentUser.name.split(' ')[0]}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Mode Toggle: Cards vs Table */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.76rem', padding: '5px 10px', borderRadius: '6px' }}
              onClick={() => setViewMode('cards')}
              title="Card Grid View (Recommended for Split Screen)"
            >
              Cards
            </button>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.76rem', padding: '5px 10px', borderRadius: '6px' }}
              onClick={() => setViewMode('table')}
              title="Detailed Table View"
            >
              Table
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={13} color="#06b6d4" /> <code style={{ color: 'var(--text-secondary)' }}>s3://nexora-enterprise-kb-vault-prod</code>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', backdropFilter: 'blur(16px)' }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search all policies, runbooks, SOPs, tags, AWS keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Department Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Departments (6)</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="IT Support">IT Support</option>
            <option value="Operations">Operations</option>
            <option value="Management">Management</option>
          </select>
        </div>

        {/* Classification Filter */}
        <div>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Classifications (4)</option>
            <option value="PUBLIC_INTERNAL">Public Internal</option>
            <option value="DEPARTMENT_ONLY">Department Only</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </div>

        {(searchQuery || selectedDept !== 'ALL' || selectedClassification !== 'ALL' || viewScope !== 'ALL') && (
          <button 
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedClassification('ALL');
              setViewScope('ALL');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* RENDER MODE 1: CARD GRID VIEW (Default & Responsive) */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredDocs.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No matching documents found</div>
              <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>Try clearing filters or search query to browse all 21 enterprise policies.</div>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isAccessible = apiService.canAccessDocument(currentUser, doc);
              const deptColor = getDepartmentColor(doc.department);
              return (
                <div
                  key={doc.id}
                  className="glass-card"
                  onClick={() => onViewDocument(doc.id)}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    border: `1px solid ${isAccessible ? 'rgba(99, 102, 241, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  <div>
                    {/* Top Badge Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                      <span className="badge badge-dept" style={{ borderColor: `${deptColor}40`, color: deptColor, background: `${deptColor}15` }}>
                        {doc.department}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getClassificationBadge(doc.classification)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v{doc.version}</span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <FileText size={20} color={deptColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {doc.title}
                      </h3>
                    </div>

                    {/* S3 Storage Path */}
                    <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.73rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px', wordBreak: 'break-all' }}>
                      <span style={{ color: '#06b6d4' }}>s3://</span>{doc.s3Key}
                    </div>

                    {/* Metadata Summary */}
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {doc.summary}
                    </p>
                  </div>

                  {/* Card Footer with Inspect Button */}
                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <Database size={13} color="#a855f7" />
                      <span>{doc.chunkCount} Chunks</span>
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDocument(doc.id);
                      }}
                      title="Inspect full policy content and S3 metadata sidecar"
                    >
                      <Eye size={14} />
                      <span>Inspect Storage</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RENDER MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="enterprise-table-wrapper" style={{ boxShadow: 'var(--shadow-md)', background: 'var(--bg-card)' }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Document Title & File</th>
                <th>Department</th>
                <th>Classification</th>
                <th>Access Status</th>
                <th>Vector Chunks</th>
                <th>Uploaded By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={32} color="#f59e0b" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>No matching documents found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isAccessible = apiService.canAccessDocument(currentUser, doc);
                  const deptColor = getDepartmentColor(doc.department);
                  return (
                    <tr 
                      key={doc.id} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => onViewDocument(doc.id)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${deptColor}20`, border: `1px solid ${deptColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={16} color={deptColor} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              {doc.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span>{doc.fileName}</span>
                              <span>&bull;</span>
                              <span>{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-dept" style={{ borderColor: `${deptColor}40`, color: deptColor, background: `${deptColor}15` }}>
                          {doc.department}
                        </span>
                      </td>
                      <td>{getClassificationBadge(doc.classification)}</td>
                      <td>
                        {isAccessible ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#34d399', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            <CheckCircle2 size={12} />
                            <span>Authorized</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#f87171', fontWeight: 600, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            <Lock size={12} />
                            <span>Clearance Req</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Database size={13} color="#a855f7" />
                          <strong>{doc.chunkCount}</strong> chunks
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {doc.uploadedBy.split('@')[0]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(doc.id);
                          }}
                          title="Inspect S3 storage path & content"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
