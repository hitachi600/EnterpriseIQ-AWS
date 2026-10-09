import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { ChatMessage, Citation } from '../types';
import { CitationDrawer } from '../components/CitationDrawer';
import { FeedbackModal } from '../components/FeedbackModal';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Download, 
  ShieldCheck, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Terminal,
  User,
  LifeBuoy,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';

interface ChatAssistantPageProps {
  onViewDocument: (docId: string) => void;
  onNavigateToTickets?: () => void;
  onNavigateToWorkplace?: (tab?: string) => void;
}

export const ChatAssistantPage: React.FC<ChatAssistantPageProps> = ({ 
  onViewDocument, 
  onNavigateToTickets,
  onNavigateToWorkplace 
}) => {
  const { currentUser } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<{ messageId: string; queryText: string; responseText: string; rating: 'helpful' | 'not_helpful' } | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<{ messageId: string; queryText: string; responseText: string } | null>(null);
  const [escalateSubject, setEscalateSubject] = useState<string>('');
  const [escalateCategory, setEscalateCategory] = useState<'VPN_NETWORK' | 'SOFTWARE_ACCESS' | 'HARDWARE' | 'PAYROLL_HR' | 'SECURITY_INCIDENT' | 'OTHER'>('VPN_NETWORK');
  const [escalatePriority, setEscalatePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize and update chat when persona changes
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${currentUser.id}`,
      sender: 'assistant',
      text: `👋 Authenticated as **${currentUser.name}** (${currentUser.department}).\n\nAsk any question grounded in authorized **${currentUser.department}** and company policies, or select a prompt below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      securityStatus: 'CLEAN',
      confidenceScore: 1.0
    };
    setMessages([welcomeMsg]);
  }, [currentUser.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean, compact suggested queries based on user department
  const getSuggestedQueries = () => {
    switch (currentUser.department) {
      case 'Engineering':
        return [
          'Canary deployment on EKS',
          'API Security & OAuth standards',
          'WFH & Hybrid policy',
          'Executive Bonus Matrix (RBAC test)'
        ];
      case 'Human Resources':
        return [
          'WFH & Hybrid Schedule',
          'Annual & Parental Leave days',
          'Healthcare & 401(k) benefits',
          'Troubleshoot VPN 504'
        ];
      case 'Finance':
        return [
          'Travel meal per diem (₹2.5k)',
          'Executive Bonus Matrix',
          'Approval thresholds (> ₹50k)',
          'Password rotation policy'
        ];
      case 'IT Support':
        return [
          'VPN 504 & YubiKey MFA',
          '90-day Password Policy',
          'Disaster Recovery SLAs',
          'Executive Bonus Matrix (RBAC test)'
        ];
      case 'Operations':
        return [
          'Multi-Region DR (RTO < 15m)',
          'Field travel reimbursement',
          'WFH equipment stipend (₹50k)',
          'Password rotation policy'
        ];
      case 'Management':
        return [
          'Executive Bonus Matrix',
          '2026-2028 Strategic Roadmap',
          'Disaster Recovery SLAs',
          'Production EKS Canary'
        ];
      default:
        return [
          'WFH & Hybrid policy',
          'Travel expense reimbursement',
          'Troubleshoot VPN 504',
          'Canary deployment on EKS'
        ];
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      departmentScope: currentUser.department
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const assistantResponse = await apiService.queryBedrockRag(currentUser, textToSend.trim());
      setMessages(prev => [...prev, assistantResponse]);
    } catch (err) {
      console.error('Error querying Bedrock RAG:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ **System Error:** Unable to reach Amazon Bedrock Knowledge Base. Please check AWS Lambda / API Gateway connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityStatus: 'CLEAN'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Session reset for **${currentUser.name}** (${currentUser.department}). Ready for authorized knowledge retrieval.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityStatus: 'CLEAN'
      }
    ]);
  };

  const handleExportChat = () => {
    const chatContent = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexora-Chat-${currentUser.department}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleExecuteAction = async (msgId: string, action: NonNullable<ChatMessage['actionIntent']>) => {
    try {
      if (action.type === 'LEAVE_REQUEST') {
        await apiService.createLeaveRequest({
          employeeId: currentUser.employeeId,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
          department: currentUser.department,
          leaveType: action.data.leaveType || 'VACATION',
          startDate: action.data.startDate || '2026-10-15',
          endDate: action.data.endDate || '2026-10-18',
          totalDays: action.data.totalDays || 3,
          reason: action.data.reason || 'Leave requested via Bedrock Workplace Assistant',
          policyCitation: action.data.policyCitation || 'NEX-HR-LV-003'
        });
      } else if (action.type === 'SUPPORT_TICKET') {
        await apiService.createSupportTicket({
          employeeId: currentUser.employeeId,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
          department: currentUser.department,
          category: action.data.category || 'OTHER',
          priority: action.data.priority || 'HIGH',
          status: 'OPEN',
          subject: action.data.subject || 'Support Ticket',
          description: action.data.description || 'Reported via Chat Assistant',
          assignedTo: 'Unassigned (IT Queue)',
          conversationContext: action.data.conversationContext
        });
      } else if (action.type === 'EXPENSE_CLAIM') {
        await apiService.createExpenseClaim({
          employeeId: currentUser.employeeId,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
          department: currentUser.department,
          category: action.data.category || 'DOMESTIC_MEAL',
          amount: action.data.amount || 2500.00,
          currency: action.data.currency || 'INR',
          dateIncurred: new Date().toISOString().split('T')[0],
          merchant: action.data.merchant || 'Enterprise Vendor',
          description: action.data.description || 'Expense claim from AI Assistant',
          complianceStatus: 'COMPLIANT',
          policyLimitNote: action.data.policyLimitNote || 'Compliant with NEX-FIN-EXP-001'
        });
      } else if (action.type === 'ACCESS_REQUEST') {
        await apiService.createAccessRequest({
          employeeId: currentUser.employeeId,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
          department: currentUser.department,
          systemName: action.data.systemName || 'AWS_IAM_ROLE',
          roleRequested: action.data.roleRequested || 'Temporary IAM Elevated Role',
          justification: action.data.justification || 'Requested via Bedrock AI Assistant',
          durationDays: action.data.durationDays || 7
        });
      }

      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.actionIntent) {
          return {
            ...m,
            actionIntent: {
              ...m.actionIntent,
              status: 'EXECUTED'
            }
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  };

  const handleToggleVoiceDictation = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => (result as any)[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Live speech recognition warning:', event.error);
          setIsRecording(false);
          // If input is still empty, populate a contextual voice query
          setInputText((prev) => {
            if (!prev.trim()) {
              const sampleQueries = [
                "Apply for 3 days vacation leave from Oct 15 to Oct 18",
                "How do I troubleshoot VPN error 504 and reset YubiKey MFA?",
                "Submit an expense claim of ₹2,450 for domestic travel dinner",
                "What are our Kubernetes canary deployment steps?"
              ];
              return sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
            }
            return prev;
          });
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition API start error, using simulation fallback:', err);
      }
    }

    // Fallback simulation for environments without microphone access
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sampleQueries = [
        "Apply for 3 days vacation leave from Oct 15 to Oct 18",
        "How do I troubleshoot VPN error 504 and reset YubiKey MFA?",
        "Submit an expense claim of ₹2,450 for domestic travel dinner",
        "What are our Kubernetes canary deployment steps?"
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setInputText(randomQuery);
    }, 1500);
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const plainText = text.replace(/[*#`_\[\]]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Rich Markdown & Alert Formatter
  const renderFormattedMessage = (text: string) => {
    // Check if it's a security alert or access denied block
    const isAccessDenied = text.includes('Access Denied');
    const isGuardrail = text.includes('Security Alert') || text.includes('Bedrock Guardrail');
    const isNotFound = text.includes('No Grounded Company Documentation Found');

    if (isAccessDenied) {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          color: '#fca5a5',
          fontSize: '0.92rem',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>
            <Lock size={18} />
            <span>Zero-Trust RBAC Access Denied</span>
          </div>
          <div style={{ whiteSpace: 'pre-line', color: '#f8fafc' }}>
            {text}
          </div>
        </div>
      );
    }

    if (isGuardrail) {
      return (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          color: '#fde68a',
          fontSize: '0.92rem',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span>Amazon Bedrock Guardrail Intervened</span>
          </div>
          <div style={{ whiteSpace: 'pre-line', color: '#f8fafc' }}>
            {text}
          </div>
        </div>
      );
    }

    if (isNotFound) {
      return (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          color: '#bfdbfe',
          fontSize: '0.92rem',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>
            <CheckCircle2 size={18} />
            <span>Anti-Hallucination Safe Response</span>
          </div>
          <div style={{ whiteSpace: 'pre-line', color: '#f8fafc' }}>
            {text}
          </div>
        </div>
      );
    }

    // Standard markdown formatted text
    const lines = text.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.93rem', lineHeight: 1.65 }}>
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />;
          
          // Bold formatting
          let formattedLine: React.ReactNode = line;
          if (line.includes('**')) {
            const parts = line.split('**');
            formattedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#ffffff', fontWeight: 700 }}>{part}</strong> : part);
          }

          // Bullet point
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '6px' }}>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>•</span>
                <div>{formattedLine}</div>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '6px' }}>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{line.trim().split('.')[0]}.</span>
                <div>{formattedLine}</div>
              </div>
            );
          }

          return <div key={lIdx}>{formattedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 className="page-title">
            <Sparkles size={20} color="#6366f1" />
            <span>AI Knowledge Assistant</span>
            <span className="badge badge-dept" style={{ fontSize: '0.7rem', marginLeft: '6px' }}>Grounded RAG</span>
          </h1>
          <p className="page-subtitle">
            Zero-trust knowledge retrieval grounded strictly in verified corporate SOPs and runbooks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-secondary" onClick={handleExportChat} title="Export Transcript" style={{ fontSize: '0.76rem', padding: '5px 12px' }}>
            <Download size={13} />
            <span>Export</span>
          </button>
          <button className="btn btn-outline" onClick={handleClearChat} title="Clear Session" style={{ fontSize: '0.76rem', padding: '5px 12px' }}>
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="chat-container">
        {/* Dynamic Clearance Header Banner */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={13} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
              Bedrock Knowledge Base
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
              Scope: {currentUser.department}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Cpu size={13} color="#a855f7" />
            <span>Temp 0.1 Grounded</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="chat-messages-area" id="chat-messages-scroll-area">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id || idx} 
                className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}
                id={`chat-msg-${idx}`}
                style={{ animation: 'modalIn 0.25s ease-out' }}
              >
                {/* Avatar */}
                <div className={`chat-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`} style={{ overflow: 'hidden' }}>
                  {isUser ? (
                    <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                </div>

                {/* Bubble Body */}
                <div className="bubble-content" style={{ width: '100%' }}>
                  {/* Sender Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 700 }}>{isUser ? currentUser.name : 'EnterpriseIQ Assistant (Bedrock RAG)'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Formatted Content */}
                  {renderFormattedMessage(msg.text)}

                  {/* Bedrock Action Group / Tool Execution Interactive Card */}
                  {msg.actionIntent && (
                    <div style={{
                      marginTop: '12px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: msg.actionIntent.status === 'EXECUTED' 
                        ? 'rgba(16, 185, 129, 0.12)' 
                        : 'rgba(99, 102, 241, 0.14)',
                      border: msg.actionIntent.status === 'EXECUTED' 
                        ? '1px solid rgba(16, 185, 129, 0.4)' 
                        : '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Zap size={16} color={msg.actionIntent.status === 'EXECUTED' ? '#34d399' : '#818cf8'} />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                            {msg.actionIntent.title}
                          </span>
                        </div>
                        <span className={`badge ${msg.actionIntent.status === 'EXECUTED' ? 'badge-success' : 'badge-dept'}`} style={{ fontSize: '0.68rem' }}>
                          {msg.actionIntent.status === 'EXECUTED' ? 'EXECUTED IN WORKPLACE HUB' : 'BEDROCK ACTION AGENT'}
                        </span>
                      </div>

                      {/* Action details preview */}
                      <div style={{
                        fontSize: '0.8rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {msg.actionIntent.type === 'LEAVE_REQUEST' && (
                          <>
                            <div><strong>Leave Type:</strong> <span style={{ color: '#67e8f9' }}>{msg.actionIntent.data.leaveType}</span> • <strong>Duration:</strong> {msg.actionIntent.data.totalDays} Days ({msg.actionIntent.data.startDate} to {msg.actionIntent.data.endDate})</div>
                            <div><strong>Grounding Policy:</strong> <span style={{ color: '#a5b4fc' }}>{msg.actionIntent.data.policyCitation}</span></div>
                          </>
                        )}
                        {msg.actionIntent.type === 'SUPPORT_TICKET' && (
                          <>
                            <div><strong>Category:</strong> <span style={{ color: '#67e8f9' }}>{msg.actionIntent.data.category}</span> • <strong>Priority:</strong> <span style={{ color: '#f87171' }}>{msg.actionIntent.data.priority}</span></div>
                            <div><strong>Subject:</strong> {msg.actionIntent.data.subject}</div>
                          </>
                        )}
                        {msg.actionIntent.type === 'EXPENSE_CLAIM' && (
                          <>
                            <div><strong>Amount:</strong> <span style={{ color: '#34d399', fontWeight: 700 }}>₹{msg.actionIntent.data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span> • <strong>Category:</strong> {msg.actionIntent.data.category}</div>
                            <div><strong>Merchant:</strong> {msg.actionIntent.data.merchant} ({msg.actionIntent.data.policyLimitNote})</div>
                          </>
                        )}
                        {msg.actionIntent.type === 'ACCESS_REQUEST' && (
                          <>
                            <div><strong>System:</strong> <span style={{ color: '#67e8f9' }}>{msg.actionIntent.data.systemName}</span> • <strong>Duration:</strong> {msg.actionIntent.data.durationDays} Days</div>
                            <div><strong>Role:</strong> {msg.actionIntent.data.roleRequested}</div>
                          </>
                        )}
                      </div>

                      {/* Execution Button */}
                      {msg.actionIntent.status !== 'EXECUTED' ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.8rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleExecuteAction(msg.id, msg.actionIntent!)}
                        >
                          <Zap size={14} />
                          <span>⚡ Execute & Submit to Enterprise Systems</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <CheckCircle2 size={16} color="#34d399" />
                            Successfully recorded in enterprise database & EventBridge notified!
                          </span>
                          {onNavigateToWorkplace && (
                            <button
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                              onClick={() => onNavigateToWorkplace(msg.actionIntent?.type === 'SUPPORT_TICKET' ? 'tickets' : 'workplace')}
                            >
                              View in Workplace Hub →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Citations Card Row */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="citation-chip-row">
                      <div style={{ width: '100%', fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} />
                        <span>Verified S3 Document Citations ({msg.citations.length}):</span>
                      </div>
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          id={`citation-btn-${cit.id}`}
                          className="citation-chip"
                          onClick={() => setSelectedCitation(cit)}
                          title="Click to view full chunk excerpt & S3 URI"
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            padding: '6px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <FileText size={14} color="#818cf8" />
                          <span style={{ fontWeight: 600 }}>{cit.documentTitle}</span>
                          <span style={{ color: '#34d399', fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {(cit.relevanceScore * 100).toFixed(0)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Footer Metrics & Actions */}
                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {msg.latencyMs && <span>⚡ {msg.latencyMs}ms latency</span>}
                        {msg.tokensUsed && <span>• 🤖 {msg.tokensUsed.total} tokens</span>}
                        {msg.confidenceScore !== undefined && <span>• 🎯 Score: {(msg.confidenceScore * 100).toFixed(0)}%</span>}
                      </div>

                      {/* Feedback, Voice Polly & Escalation buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-outline"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: speakingMsgId === msg.id ? '#10b981' : 'var(--text-secondary)',
                            borderColor: speakingMsgId === msg.id ? '#10b981' : 'var(--border-subtle)'
                          }}
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          title="Amazon Polly Neural Voice Readout"
                        >
                          {speakingMsgId === msg.id ? <VolumeX size={12} color="#10b981" /> : <Volume2 size={12} />}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          className="btn btn-outline"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#38bdf8',
                            borderColor: 'rgba(56, 189, 248, 0.3)'
                          }}
                          onClick={() => {
                            const prevUserMsg = messages.slice(0, idx).reverse().find(m => m.sender === 'user');
                            setEscalateTarget({
                              messageId: msg.id,
                              queryText: prevUserMsg ? prevUserMsg.text : 'Employee Inquiry',
                              responseText: msg.text
                            });
                            setEscalateSubject(prevUserMsg ? prevUserMsg.text.substring(0, 60) : 'Support Request');
                          }}
                          title="Escalate directly to IT Support Ticket"
                        >
                          <LifeBuoy size={12} />
                          <span>Escalate Ticket</span>
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '4px' }}
                          onClick={() => {
                            const prevUserMsg = messages.slice(0, idx).reverse().find(m => m.sender === 'user');
                            setFeedbackTarget({
                              messageId: msg.id,
                              queryText: prevUserMsg ? prevUserMsg.text : 'Nexora AI Query',
                              responseText: msg.text,
                              rating: 'helpful'
                            });
                          }}
                          title="Accurate and helpful"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '4px' }}
                          onClick={() => {
                            const prevUserMsg = messages.slice(0, idx).reverse().find(m => m.sender === 'user');
                            setFeedbackTarget({
                              messageId: msg.id,
                              queryText: prevUserMsg ? prevUserMsg.text : 'Nexora AI Query',
                              responseText: msg.text,
                              rating: 'not_helpful'
                            });
                          }}
                          title="Needs correction"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="chat-bubble assistant" style={{ animation: 'modalIn 0.2s ease-out' }}>
              <div className="chat-avatar ai-avatar">
                <Sparkles size={18} />
              </div>
              <div className="bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'rgba(30, 41, 59, 0.9)' }}>
                <RefreshCw size={18} className="spin-animation" color="#6366f1" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    Querying Bedrock Knowledge Base ({currentUser.department})...
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Applying Titan V2 vector embedding search & Claude 3.5 Sonnet factual synthesis
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Suggested Queries Bar */}
        <div style={{ 
          padding: '8px 16px', 
          background: 'rgba(11, 17, 32, 0.9)', 
          borderTop: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          overflowX: 'auto' 
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#818cf8', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> Suggested:
          </span>
          {getSuggestedQueries().map((q, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{ 
                fontSize: '0.74rem', 
                padding: '4px 10px', 
                borderRadius: 'var(--radius-full)', 
                whiteSpace: 'nowrap',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)'
              }}
              onClick={() => handleSend(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Recording Visualizer Banner */}
        {isRecording && (
          <div style={{
            padding: '8px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderTop: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#fca5a5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
              <span><strong>Amazon Transcribe Live Audio Stream:</strong> Listening to speech query...</span>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '2px 8px', fontSize: '0.72rem', borderColor: '#ef4444', color: '#ef4444' }}
              onClick={() => setIsRecording(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form 
          className="chat-input-wrapper" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              color: isRecording ? '#ef4444' : 'var(--text-secondary)',
              borderColor: isRecording ? '#ef4444' : 'var(--border-subtle)',
              background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleToggleVoiceDictation}
            title={isRecording ? 'Stop Recording' : 'Voice Dictation (Amazon Transcribe)'}
          >
            {isRecording ? <MicOff size={18} color="#ef4444" /> : <Mic size={18} />}
          </button>

          <textarea
            id="chat-input-textarea"
            className="chat-textarea"
            placeholder={`Ask a question grounded in authorized ${currentUser.department} policies... (e.g., "Apply for 3 days vacation leave", "Troubleshoot VPN 504", "Canary deployment")`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button 
            id="btn-chat-send"
            type="submit" 
            className="btn-send" 
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={16} />
            <span>Ask AI</span>
          </button>
        </form>
      </div>

      {/* Citation Slide-in Drawer */}
      <CitationDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
        onViewDocument={onViewDocument}
      />

      {/* Feedback Rating Modal */}
      {feedbackTarget && (
        <FeedbackModal
          messageId={feedbackTarget.messageId}
          queryText={feedbackTarget.queryText}
          responseText={feedbackTarget.responseText}
          initialRating={feedbackTarget.rating}
          onClose={() => setFeedbackTarget(null)}
          onSubmitted={() => {}}
        />
      )}

      {/* Escalation Notification Toast */}
      {escalateSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{escalateSuccess}</span>
        </div>
      )}

      {/* Escalation to Support Ticket Modal */}
      {escalateTarget && (
        <div className="modal-backdrop" onClick={() => setEscalateTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={20} color="#06b6d4" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Escalate AI Inquiry to IT / Enterprise Support
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setEscalateTarget(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Ticket Subject *</label>
                <input
                  type="text"
                  className="input-text"
                  value={escalateSubject}
                  onChange={(e) => setEscalateSubject(e.target.value)}
                  placeholder="e.g. Unresolved VPN connection error"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="input-select"
                    value={escalateCategory}
                    onChange={(e) => setEscalateCategory(e.target.value as any)}
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
                    value={escalatePriority}
                    onChange={(e) => setEscalatePriority(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="LOW">Low (24h SLA)</option>
                    <option value="MEDIUM">Medium (8h SLA)</option>
                    <option value="HIGH">High (4h SLA)</option>
                    <option value="CRITICAL">Critical (2h SLA)</option>
                  </select>
                </div>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ATTACHED CONVERSATION GROUNDING:
                </div>
                <div><strong>Employee Query:</strong> "{escalateTarget.queryText}"</div>
                <div style={{ marginTop: '4px' }}><strong>AI Attempted Response:</strong> {escalateTarget.responseText.substring(0, 120)}...</div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setEscalateTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!escalateSubject.trim()) return;
                  await apiService.createSupportTicket({
                    employeeId: currentUser.employeeId,
                    employeeName: currentUser.name,
                    employeeEmail: currentUser.email,
                    department: currentUser.department,
                    category: escalateCategory,
                    priority: escalatePriority,
                    status: 'OPEN',
                    subject: escalateSubject,
                    description: `Escalated directly from AI conversation. Query: "${escalateTarget.queryText}"`,
                    conversationContext: `Query: ${escalateTarget.queryText}\nAI Response: ${escalateTarget.responseText}`,
                    assignedTo: escalateCategory === 'VPN_NETWORK' || escalateCategory === 'HARDWARE' ? 'David Kim (IT Tier 2)' : 'Alex Mercer (Admin)'
                  });
                  setEscalateTarget(null);
                  setEscalateSuccess('Support ticket created and routed to IT support team!');
                  setTimeout(() => setEscalateSuccess(null), 4000);
                }}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  border: 'none'
                }}
              >
                Dispatch Ticket to Support Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
