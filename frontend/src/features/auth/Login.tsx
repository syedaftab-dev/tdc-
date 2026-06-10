import React, { useState } from 'react';
import { Heart, Lock, User, AlertCircle } from 'lucide-react';
import { Matchmaker } from '../../types';
import { loginMatchmaker } from '../../services/api';

interface LoginProps {
  onLoginSuccess: (matchmaker: Matchmaker) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const matchmaker = await loginMatchmaker(username, password);
      onLoginSuccess(matchmaker);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please use the quick-fill options below.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-logo">
          <Heart className="logo-icon animate-float" fill="#ff4a7a" size={40} />
          <h1>THE DATE CREW</h1>
          <p>Matchmaker Portal MVP</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error animate-fade-in">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick-Fill Credentials:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => handleQuickFill('karan', 'tdcpassword')}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '8px 12px', justifyContent: 'flex-start' }}
            >
              <strong>Karan Johar</strong> (karan / tdcpassword)
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickFill('sima', 'taparia')}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '8px 12px', justifyContent: 'flex-start' }}
            >
              <strong>Sima Taparia</strong> (sima / taparia)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
