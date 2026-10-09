import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Key, Shield, Server, Database, RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, switchPersona, allPersonas, isAdmin } = useAuth();
  const config = apiService.getConfiguration();
  
  const [isLiveMode, setIsLiveMode] = useState<boolean>(config.isLiveAwsMode);
  const [apiUrl, setApiUrl] = useState<string>(config.apiGatewayBaseUrl);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    apiService.setConfiguration({
      isLiveAwsMode: isLiveMode,
      apiGatewayBaseUrl: apiUrl.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo documents, audit logs, and feedback to initial factory defaults?')) {
      apiService.resetToDefault();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="page-container" id="settings-page" style={{ animation: 'modalIn 0.25s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Key size={24} color="#6366f1" />
            <span>Cognito, IAM & Backend Settings</span>
          </h1>
          <p className="page-subtitle">
            Inspect active JWT tokens, IAM policies, and switch between enterprise Cognito RBAC identities.
          </p>
        </div>
      </div>

      {/* Quick Identity Switcher Strip */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700 }}>
            <Shield size={16} color="#6366f1" />
            <span>Select Active Cognito User Identity</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to assume identity & refresh JWT</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {allPersonas.map((persona) => {
            const isActive = persona.id === currentUser.id;
            return (
              <button
                key={persona.id}
                onClick={() => switchPersona(persona.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.2) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <img src={persona.avatar} alt={persona.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{persona.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)' }}>{persona.department}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Cognito JWT Claims Viewer */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Lock size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cognito JWT Claims (Decoded)</h3>
          </div>

          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: '#a5b4fc',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto'
          }}>
{JSON.stringify({
  "sub": currentUser.id,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_NexoraUserPool",
  "cognito:username": currentUser.email,
  "email": currentUser.email,
  "name": currentUser.name,
  "custom:department": currentUser.department,
  "custom:employee_id": currentUser.employeeId,
  "cognito:groups": currentUser.cognitoGroups,
  "clearance_level": currentUser.clearanceLevel,
  "token_use": "access",
  "auth_time": Math.floor(Date.now() / 1000) - 3600,
  "exp": Math.floor(Date.now() / 1000) + 7200
}, null, 2)}
          </pre>
        </div>

        {/* AWS Backend Mode & API Gateway Switch */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Server size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AWS API Gateway Integration</h3>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Backend Execution Mode:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${!isLiveMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => setIsLiveMode(false)}
                >
                  Demo Sandbox Mode
                </button>
                <button
                  type="button"
                  className={`btn ${isLiveMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => setIsLiveMode(true)}
                >
                  Live AWS Backend
                </button>
              </div>
            </div>

            {isLiveMode && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Amazon API Gateway REST Endpoint URL:
                </label>
                <input
                  type="url"
                  placeholder="https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {savedSuccess && (
                <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> Configuration Saved
                </span>
              )}
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                Save Settings
              </button>
            </div>
          </form>

          {/* Reset Factory Data */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Factory Reset Demo State</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Restores all original documents, audit logs, and metrics.</div>
              </div>
              <button className="btn btn-secondary" onClick={handleResetData} style={{ fontSize: '0.8rem' }}>
                <RefreshCw size={14} />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
