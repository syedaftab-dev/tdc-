import React, { useState, useEffect } from 'react';
import { LogOut, Settings, MessageSquare, Plus, Heart, Search, FileText, Compass } from 'lucide-react';
import { Client, Profile, Matchmaker, MatchScoreResult } from '../../types';
import { ClientDetails } from './ClientDetails';
import { MatchList } from './MatchList';
import { MatchDetailsModal } from '../matches/MatchDetailsModal';
import { EmailPitchModal } from '../matches/EmailPitchModal';
import { SettingsModal } from '../settings/SettingsModal';
import { fetchClients, fetchMatchPool, addClientNote, pitchClientMatch } from '../../services/api';

interface DashboardProps {
  user: Matchmaker;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // 1. Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [pool, setPool] = useState<Profile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<'profile' | 'matches'>('profile');
  const [clientSearch, setClientSearch] = useState('');

  // 3. Modal States
  const [compareCandidate, setCompareCandidate] = useState<Profile | null>(null);
  const [compareResult, setCompareResult] = useState<MatchScoreResult | null>(null);
  const [pitchCandidate, setPitchCandidate] = useState<Profile | null>(null);
  const [pitchResult, setPitchResult] = useState<MatchScoreResult | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 4. Notes input state
  const [newNoteText, setNewNoteText] = useState('');

  // Load clients on mount/user change
  useEffect(() => {
    fetchClients(user.name)
      .then((data) => {
        setClients(data);
        if (data.length > 0) {
          setSelectedClientId(data[0].id);
        }
      })
      .catch((err) => console.error('Error fetching clients:', err));
  }, [user.name]);

  // Load match pool whenever active client changes
  useEffect(() => {
    if (selectedClientId) {
      fetchMatchPool(selectedClientId)
        .then((data) => setPool(data))
        .catch((err) => console.error('Error fetching pool:', err));
    }
  }, [selectedClientId]);

  // Find active client
  const activeClient = clients.find((c) => c.id === selectedClientId) || null;

  // Handler: Add a note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !newNoteText.trim()) return;

    try {
      const updatedClient = await addClientNote(activeClient.id, user.name, newNoteText.trim());
      setClients(clients.map((c) => c.id === updatedClient.id ? updatedClient : c));
      setNewNoteText('');
    } catch (err: any) {            
      alert(err.message || 'Failed to add note');
    }
  };

  // Handler: Match Sent
  const handleMatchSent = async (emailDraft: string) => {
    if (!activeClient || !pitchCandidate) return;

    try {
      const updatedClient = await pitchClientMatch(activeClient.id, pitchCandidate.id, emailDraft);
      setClients(clients.map((c) => c.id === updatedClient.id ? updatedClient : c));
      setPitchCandidate(null);
      setPitchResult(null);
      setActiveTab('profile'); // Switch back to view history
    } catch (err: any) {
      alert(err.message || 'Failed to send pitch');
    }
  };

  // Filter clients on sidebar search
  const filteredClients = clients.filter((c) => {
    const search = clientSearch.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
      c.city.toLowerCase().includes(search) ||
      c.status.toLowerCase().includes(search)
    );
  });

  const getStatusClass = (status: Client['status']) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Active Search': return 'status-search';
      case 'Sent Matches': return 'status-matches';
      case 'Meeting Stage': return 'status-meeting';
      case 'On Hold': return 'status-hold';
      case 'Matched': return 'status-matched';
      default: return '';
    }
  };

  // Resolve profile names from ID for history render
  const resolveProfileName = (id: string) => {
    const profile = pool.find((p) => p.id === id);
    return profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Candidate';
  };

  const resolveProfileAgeAndCity = (id: string) => {
    const profile = pool.find((p) => p.id === id);
    return profile ? `${profile.age} yrs, ${profile.city}` : '';
  };

  return (
    <div className="app-container">
      {/* Portal Header */}
      <header className="header">
        <div className="header-logo">
          <Heart size={24} fill="var(--color-primary)" />
          <h2>THE DATE CREW</h2>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setIsSettingsOpen(true)} title="Settings">
            <Settings size={18} />
          </button>
          
          <div className="user-badge">
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'black' }}>{user.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.role}</div>
            </div>
          </div>

          <button className="btn btn-danger" style={{ padding: '8px' }} onClick={onLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="main-layout">
        
        {/* Sidebar: Clients list */}
        <aside className="sidebar">
          <div className="sidebar-search">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search assigned client..."
                className="search-input"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sidebar-title">Assigned Clients ({filteredClients.length})</div>
          
          <div className="client-list">
            {filteredClients.map((c) => (
              <div
                key={c.id}
                className={`client-item ${selectedClientId === c.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedClientId(c.id);
                  setActiveTab('profile'); // Reset tab on swap
                }}
              >
                <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', flexShrink: 0 }}>
                  {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                </div>
                <div className="client-info">
                  <div className="client-name-row">
                    <span className="client-name">{c.firstName} {c.lastName}</span>
                    <span className={`status-badge ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="client-meta">
                    {c.age} yrs • {c.city} • {c.maritalStatus}
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No clients match your filter.
              </div>
            )}
          </div>
        </aside>

        {/* Workspace: Middle details and right side notes */}
        {activeClient ? (
          <div className="workspace">
            {/* Middle Section: Tabs + Details */}
            <div className="workspace-main">
              <div className="workspace-tabs">
                <button
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FileText size={16} />
                  <span>Client Biodata</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                  onClick={() => setActiveTab('matches')}
                >
                  <Compass size={16} />
                  <span>Find Match Pool</span>
                </button>
              </div>

              <div className="workspace-content">
                {activeTab === 'profile' ? (
                  <ClientDetails client={activeClient} />
                ) : (
                  <MatchList
                    client={activeClient}
                    pool={pool}
                    onSelectCandidate={(candidate, result) => {
                      setCompareCandidate(candidate);
                      setCompareResult(result);
                    }}
                    onSendPitchDirect={(candidate, result) => {
                      setPitchCandidate(candidate);
                      setPitchResult(result);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Side: Client Notes & Match History */}
            <aside className="workspace-detail-panel">
              <div className="panel-header">
                <h3>
                  <MessageSquare size={16} />
                  <span>Matchmaker Console</span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Managing search for {activeClient.firstName}
                </span>
              </div>

              <div className="panel-scrollable">
                {/* Section 1: Quick Notes */}
                <div>
                  <div className="panel-section-title">Meeting & Call Notes</div>
                  
                  <form onSubmit={handleAddNote} className="note-form" style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="Add meeting notes, calls, feedback..."
                      className="note-input"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px' }}>
                      <Plus size={16} />
                    </button>
                  </form>

                  <div className="notes-list">
                    {activeClient.notes.map((note) => (
                      <div className="note-item" key={note.id}>
                        <div className="note-header">
                          <span style={{ fontWeight: 600 }}>{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="note-text">{note.text}</div>
                      </div>
                    ))}
                    {activeClient.notes.length === 0 && (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '12px' }}>
                        No notes recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Match History */}
                <div>
                  <div className="panel-section-title">Pitched Match History ({activeClient.matchHistory.length})</div>
                  <div className="history-list">
                    {activeClient.matchHistory.map((item, idx) => (
                      <div className="history-item" key={idx}>
                        <div>
                          <div className="history-name">{resolveProfileName(item.profileId)}</div>
                          <div className="history-date">
                            {resolveProfileAgeAndCity(item.profileId)} • Pitched {new Date(item.sentAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="status-badge status-matches" style={{ fontSize: '0.6rem' }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {activeClient.matchHistory.length === 0 && (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '12px' }}>
                        No matches pitched yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={64} className="empty-state-icon" style={{ color: 'rgba(255, 74, 122, 0.2)' }} />
            <h3>Select a customer</h3>
            <p>Please select a customer from the left sidebar to review biodata and assign matches.</p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Compare Match Details Modal */}
      {compareCandidate && compareResult && activeClient && (
        <MatchDetailsModal
          isOpen={!!compareCandidate}
          onClose={() => {
            setCompareCandidate(null);
            setCompareResult(null);
          }}
          client={activeClient}
          candidate={compareCandidate}
          matchResult={compareResult}
          onOpenPitch={() => {
            // Close comparison modal and transfer candidate to pitch modal
            setPitchCandidate(compareCandidate);
            setPitchResult(compareResult);
            setCompareCandidate(null);
            setCompareResult(null);
          }}
        />
      )}

      {/* Email Pitch Composer Modal */}
      {pitchCandidate && pitchResult && activeClient && (
        <EmailPitchModal
          isOpen={!!pitchCandidate}
          onClose={() => {
            setPitchCandidate(null);
            setPitchResult(null);
          }}
          client={activeClient}
          candidate={pitchCandidate}
          matchResult={pitchResult}
          onMatchSent={handleMatchSent}
        />
      )}
    </div>
  );
};
