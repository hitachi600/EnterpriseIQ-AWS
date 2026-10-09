import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { FeedbackRecord } from '../types';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);

  useEffect(() => {
    setFeedbackList(apiService.getFeedbackRecords());
  }, []);

  const helpfulCount = feedbackList.filter(f => f.rating === 'helpful').length;
  const unhelpfulCount = feedbackList.filter(f => f.rating === 'not_helpful').length;
  const satisfactionRate = feedbackList.length > 0 ? ((helpfulCount / feedbackList.length) * 100).toFixed(0) : 100;

  return (
    <div className="page-container" id="feedback-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ThumbsUp size={24} color="#6366f1" />
            <span>RAG Model Evaluation & User Feedback</span>
          </h1>
          <p className="page-subtitle">
            Continuous quality feedback stored in <strong style={{ color: 'var(--text-primary)' }}>Amazon DynamoDB</strong> for document lifecycle and prompt tuning.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <span className="stat-val" style={{ color: '#10b981' }}>{satisfactionRate}%</span>
          <span className="stat-label">User Satisfaction Rate</span>
        </div>

        <div className="stat-card">
          <span className="stat-val" style={{ color: '#6366f1' }}>{helpfulCount}</span>
          <span className="stat-label">Verified Grounded Answers (Thumbs Up)</span>
        </div>

        <div className="stat-card">
          <span className="stat-val" style={{ color: '#f59e0b' }}>{unhelpfulCount}</span>
          <span className="stat-label">Knowledge Gap / Needs Revision Flags</span>
        </div>
      </div>

      {/* Feedback Records List */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <MessageSquare size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Logged Evaluations</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {feedbackList.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.rating === 'helpful' ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsUp size={12} /> Helpful
                    </span>
                  ) : (
                    <span className="badge badge-confidential" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsDown size={12} /> Needs Fix ({item.category})
                    </span>
                  )}
                  <span className="badge badge-dept">{item.department}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.userEmail}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.timestamp}</span>
              </div>

              <div style={{ fontSize: '0.88rem' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Employee Query: </strong>
                <span style={{ color: 'var(--text-primary)' }}>"{item.queryText}"</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                <strong>Comment / Gap Note: </strong>
                <span style={{ color: '#cbd5e1' }}>{item.comment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
