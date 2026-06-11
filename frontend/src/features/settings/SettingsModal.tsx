import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('TDC_OPENAI_API_KEY') || '';
    setApiKey(savedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('TDC_OPENAI_API_KEY', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('TDC_OPENAI_API_KEY');
    setApiKey('');
    alert('API key cleared. The application will fallback to local simulated AI.');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel animate-slide-in" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Portal Settings</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="apiKey" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> OpenAI or Groq API Key
              </label>
              <input
                id="apiKey"
                type="password"
                className="form-control"
                style={{ paddingLeft: '14px' }} // Standard input sizing
                placeholder="sk-... or gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                Optional. If provided, the app will make real API calls to Groq (<code>llama-3.3-70b-versatile</code>) or OpenAI (<code>gpt-4o-mini</code>) to generate custom matchmaking reviews and email pitches.
              </p>
            </div>

            <div className="api-key-status" style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {apiKey ? (
                <div className="api-key-status configured">
                  <Check size={16} />
                  <span>API Key Configured (Stored locally in browser)</span>
                </div>
              ) : (
                <div className="api-key-status not-configured">
                  <AlertTriangle size={16} />
                  <span>Using Offline Simulated AI (Fast & Free)</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-accent)' }}>
                About the Matching Engine:
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                The algorithm automatically incorporates gender-specific rules (age, height, income skews) and cultural factors (Nakshatra-based Horoscope Guna Milan, caste tolerance, dietary habits, and relocation preferences) to evaluate overall alignment.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            {apiKey && (
              <button type="button" className="btn btn-danger" onClick={handleClear} style={{ marginRight: 'auto' }}>
                Clear Key
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saved}>
              {saved ? 'Saved!' : 'Save & Close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
