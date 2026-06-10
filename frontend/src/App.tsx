import { useState, useEffect } from 'react';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { Matchmaker } from './types';

function App() {
  const [user, setUser] = useState<Matchmaker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session is saved in localStorage
    const savedUser = localStorage.getItem('TDC_USER_SESSION');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('TDC_USER_SESSION');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (matchmaker: Matchmaker) => {
    setUser(matchmaker);
    localStorage.setItem('TDC_USER_SESSION', JSON.stringify(matchmaker));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('TDC_USER_SESSION');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0a0612', color: 'white' }}>
        <div className="ai-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
