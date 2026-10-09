import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Cloud, Sparkles, Sun, Moon, Layers, ChevronDown, Check, BookOpen, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenTopology: () => void;
  onOpenOnboarding?: () => void;
  onOpenBlueprint?: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTopology, onOpenOnboarding, onOpenBlueprint, isDarkTheme, onToggleTheme }) => {
  const { currentUser, switchPersona, allPersonas, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="top-header" id="enterpriseiq-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-indicator" title="Bedrock Active"></span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cloud size={14} color="#818cf8" />
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ap-south-1</strong>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Claude 3.5 Sonnet</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        {/* System Study Blueprint Button */}
        {onOpenBlueprint && (
          <button 
            id="btn-system-blueprint"
            className="btn btn-primary" 
            onClick={onOpenBlueprint}
            style={{ 
              fontSize: '0.78rem', 
              padding: '5px 12px', 
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#67e8f9'
            }}
            title="Inspect 26-Module Blueprint"
          >
            <Layers size={13} />
            <span>26 Modules</span>
          </button>
        )}

        {/* New Joiner Onboarding Guide Button */}
        {onOpenOnboarding && (
          <button 
            id="btn-onboarding-guide"
            className="btn btn-secondary" 
            onClick={onOpenOnboarding}
            style={{ 
              fontSize: '0.78rem', 
              padding: '5px 12px', 
              borderRadius: 'var(--radius-full)'
            }}
            title="New Joiner Handbook"
          >
            <BookOpen size={13} color="#818cf8" />
            <span>Guide</span>
          </button>
        )}

        {/* Cloud Topology Button */}
        <button 
          id="btn-cloud-topology"
          className="btn btn-outline" 
          onClick={onOpenTopology}
          style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 'var(--radius-full)' }}
          title="AWS Architecture & Health"
        >
          <Activity size={13} color="#10b981" />
          <span>Health</span>
        </button>

        {/* Theme Toggle */}
        <button 
          id="btn-theme-toggle"
          className="btn btn-outline" 
          onClick={onToggleTheme}
          style={{ padding: '5px 9px', borderRadius: 'var(--radius-full)' }}
          title="Toggle Theme"
        >
          {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User Profile Pill & Dropdown Switcher */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            id="user-profile-badge"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px 3px 5px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'var(--transition)'
            }}
            title="Switch persona"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${getDeptColor(currentUser.department)}` }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentUser.name.split(' ')[0]}</span>
              <span style={{ fontSize: '0.68rem', color: getDeptColor(currentUser.department), fontWeight: 700 }}>
                ({currentUser.department.replace('Human Resources', 'HR').replace('IT Support', 'IT')})
              </span>
            </div>
            <ChevronDown size={13} color="var(--text-muted)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                background: '#0f172a',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.2)',
                padding: '10px',
                zIndex: 100,
                animation: 'modalIn 0.2s ease-out'
              }}
            >
              <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <Shield size={13} color="#6366f1" />
                  <span>Cognito Personas</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>RBAC Isolation</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '320px', overflowY: 'auto' }}>
                {allPersonas.map((persona) => {
                  const isActive = persona.id === currentUser.id;
                  const deptColor = getDeptColor(persona.department);
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        switchPersona(persona.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        border: isActive ? `1px solid ${deptColor}` : '1px solid transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={persona.avatar} 
                          alt={persona.name} 
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: isActive ? `2px solid ${deptColor}` : '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{persona.name}</div>
                          <div style={{ fontSize: '0.68rem', color: deptColor }}>{persona.department}</div>
                        </div>
                      </div>

                      {isActive && (
                        <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700 }}>
                          <Check size={11} /> Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
