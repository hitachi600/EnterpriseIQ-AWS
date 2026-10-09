import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

export const PersonaSwitcher: React.FC = () => {
  const { currentUser, switchPersona, allPersonas } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectPersona = (id: string, name: string, dept: string) => {
    switchPersona(id);
    setToastMessage(`Switched identity to ${name} (${dept})`);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const getDeptColor = (dept: string) => {
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
    <div className="persona-switcher-bar" id="persona-switcher-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '68px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #6366f1',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100,
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 600,
          animation: 'modalIn 0.2s ease-out'
        }}>
          <Sparkles size={14} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'max-content' }}>
        <ShieldCheck size={16} color="#6366f1" />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
          RBAC Test:
        </span>
      </div>

      {/* Persona Interactive Buttons */}
      <div className="persona-badge-group">
        {allPersonas.map((persona) => {
          const isActive = persona.id === currentUser.id;
          const deptColor = getDeptColor(persona.department);
          return (
            <button
              key={persona.id}
              id={`persona-btn-${persona.id}`}
              className={`persona-chip ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectPersona(persona.id, persona.name, persona.department)}
              style={{
                borderColor: isActive ? deptColor : undefined,
                background: isActive ? `linear-gradient(135deg, ${deptColor}25 0%, #1e1b4b 100%)` : undefined,
                boxShadow: isActive ? `0 0 10px ${deptColor}35` : undefined
              }}
              title={`Switch to ${persona.name} (${persona.department})`}
            >
              <img
                src={persona.avatar}
                alt={persona.name}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isActive ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.15)'
                }}
              />
              <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '0.76rem' }}>
                {persona.name.split(' ')[0]}
              </span>
              <span style={{ 
                fontSize: '0.68rem',
                color: isActive ? '#ffffff' : deptColor,
                fontWeight: 600,
                opacity: isActive ? 1 : 0.8
              }}>
                • {persona.department.replace('Human Resources', 'HR').replace('IT Support', 'IT')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active User Clearance Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '0.74rem', 
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        minWidth: 'max-content'
      }}>
        <Lock size={12} color="#f59e0b" />
        <span style={{ color: 'var(--text-muted)' }}>Scope:</span>
        <strong style={{ color: getDeptColor(currentUser.department) }}>
          {currentUser.department}
        </strong>
      </div>
    </div>
  );
};
