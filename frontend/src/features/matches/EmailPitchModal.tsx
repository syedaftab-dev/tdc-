import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, Sparkles } from 'lucide-react';
import { Client, Profile, MatchScoreResult } from '../../types';
import { fetchAIPitchEmailDraft } from '../../services/api';
import confetti from 'canvas-confetti';

interface EmailPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  candidate: Profile;
  matchResult: MatchScoreResult;
  onMatchSent: (emailDraft: string) => void;
}

export const EmailPitchModal: React.FC<EmailPitchModalProps> = ({
  isOpen,
  onClose,
  client,
  candidate,
  matchResult,
  onMatchSent,
}) => {
  const [loading, setLoading] = useState(true);
  const [emailText, setEmailText] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchAIPitchEmailDraft(client, candidate, matchResult)
        .then((res) => {
          setEmailText(res.pitch);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setEmailText(`Subject: Match Introduction: ${candidate.firstName}\n\nHi ${client.firstName},\n\nI have found a match for you! Meet ${candidate.firstName}, a ${candidate.age} year old ${candidate.designation} at ${candidate.currentCompany} in ${candidate.city}.`);
          setLoading(false);
        });
    }
  }, [isOpen, client, candidate, matchResult]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSend = () => {
    setSending(true);
    // Simulate sending email to client
    setTimeout(() => {
      setSending(false);
      
      // Fire confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff4a7a', '#8b5cf6', '#e5a93b']
      });

      onMatchSent(emailText);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel animate-slide-in" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="animate-float" style={{ color: 'var(--color-accent)' }} />
            AI Email Pitch Generator
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="ai-loading-container">
              <div className="ai-spinner"></div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI is drafting a personalized match pitch email...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Review and customize the pitch email below before sending.
                </p>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }} onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check size={14} style={{ color: 'var(--status-active)' }} />
                      <span style={{ color: 'var(--status-active)' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                className="form-control email-container"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                style={{ width: '100%', minHeight: '300px', resize: 'vertical', display: 'block', padding: '16px' }}
              />

              <div style={{ padding: '12px', background: 'rgba(255, 74, 122, 0.05)', border: '1px solid rgba(255, 74, 122, 0.15)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                <strong>Note:</strong> Clicking &quot;Send Match Pitch&quot; will record this match inside the client&apos;s history and send a mock notification email.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={loading || sending}>
            {sending ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Send Match Pitch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
