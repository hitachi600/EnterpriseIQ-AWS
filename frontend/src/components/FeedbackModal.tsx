import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  messageId: string;
  queryText: string;
  responseText: string;
  initialRating: 'helpful' | 'not_helpful';
  onClose: () => void;
  onSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  messageId,
  queryText,
  responseText,
  initialRating,
  onClose,
  onSubmitted
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState<'helpful' | 'not_helpful'>(initialRating);
  const [category, setCategory] = useState<'OUTDATED_INFO' | 'INCORRECT_SOURCE' | 'INCOMPLETE_ANSWER' | 'WRONG_DEPARTMENT' | 'OTHER'>('OUTDATED_INFO');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.submitFeedback({
        messageId,
        queryText,
        responseText,
        userEmail: currentUser.email,
        department: currentUser.department,
        rating,
        category,
        comment: comment.trim() || 'No additional comment provided.'
      });

      setIsSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="feedback-modal-overlay">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>RAG Response Evaluation</h3>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '4px', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={48} color="#10b981" />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Feedback Logged to DynamoDB</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px' }}>
              Your evaluation will help department administrators update policies and tune Bedrock retrieval prompts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Rating Selector */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                How accurate was this response?
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${rating === 'helpful' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => setRating('helpful')}
                >
                  <ThumbsUp size={16} />
                  <span>Accurate & Helpful</span>
                </button>
                <button
                  type="button"
                  className={`btn ${rating === 'not_helpful' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => setRating('not_helpful')}
                >
                  <ThumbsDown size={16} />
                  <span>Inaccurate / Needs Fix</span>
                </button>
              </div>
            </div>

            {/* Category Dropdown */}
            {rating === 'not_helpful' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Select Issue Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="OUTDATED_INFO">Outdated Policy / Old Information</option>
                  <option value="INCORRECT_SOURCE">Incorrect Document Citation</option>
                  <option value="INCOMPLETE_ANSWER">Incomplete / Missing Steps</option>
                  <option value="WRONG_DEPARTMENT">Cross-Department Misattribution</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>
            )}

            {/* User Comment */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Additional Notes / Corrections (Optional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., The WFH stipend was increased in the Q3 policy update..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.88rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Send size={15} />
                <span>{isSubmitting ? 'Logging to DynamoDB...' : 'Submit Evaluation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
