import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Award, Send, IndianRupee } from 'lucide-react';
import { Client, Profile, MatchScoreResult } from '../../types';
import { fetchAICompatibilityAssessment } from '../../services/api';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  candidate: Profile;
  matchResult: MatchScoreResult;
  onOpenPitch: () => void;
}

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const parseInlineBold = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{part}</strong>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} style={{ margin: '8px 0 16px 20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Headers
    if (trimmed.startsWith('###')) {
      flushList();
      elements.push(
        <h4 key={index} style={{ color: 'var(--text-main)', fontFamily: 'var(--font-display)', marginTop: '16px', marginBottom: '8px', fontSize: '1rem', fontWeight: 700 }}>
          {parseInlineBold(trimmed.replace(/^###\s*/, ''))}
        </h4>
      );
    } else if (trimmed.startsWith('##')) {
      flushList();
      elements.push(
        <h3 key={index} style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', marginTop: '20px', marginBottom: '10px', fontSize: '1.15rem', fontWeight: 800 }}>
          {parseInlineBold(trimmed.replace(/^##\s*/, ''))}
        </h3>
      );
    } else if (trimmed.startsWith('h1') || trimmed.startsWith('#')) {
      flushList();
      elements.push(
        <h2 key={index} style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', marginTop: '20px', marginBottom: '10px', fontSize: '1.25rem', fontWeight: 800 }}>
          {parseInlineBold(trimmed.replace(/^#\s*/, ''))}
        </h2>
      );
    }
    // List items starting with - or *
    else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[-*]\s*/, '');
      currentList.push(
        <li key={index} style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: '1.5' }}>
          {parseInlineBold(content)}
        </li>
      );
    }
    // Normal paragraph
    else {
      flushList();
      elements.push(
        <p key={index} style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-sub)', marginBottom: '10px' }}>
          {parseInlineBold(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return elements;
};

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  candidate,
  matchResult,
  onOpenPitch,
}) => {
  const [aiLoading, setAiLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAiLoading(true);
      fetchAICompatibilityAssessment(client, candidate, matchResult)
        .then((res) => {
          setAiAnalysis(res.analysis);
          setAiLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setAiAnalysis('Could not load AI assessment. Please check your network connection.');
          setAiLoading(false);
        });
    }
  }, [isOpen, client, candidate, matchResult]);

  if (!isOpen) return null;

  const formatBreakdownName = (key: string) => {
    return key
      .replace('Compatibility', '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel animate-slide-in" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Match Assessment: {candidate.firstName} {candidate.lastName}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top Info Grid */}
          <div className="match-detail-grid" style={{ marginBottom: '24px' }}>
            {/* Left Column: Side-by-Side Comparison */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.45)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Key Comparison Matrix
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span>Metric</span>
                  <span>Client ({client.firstName})</span>
                  <span>Match ({candidate.firstName})</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Age</span>
                  <span style={{ color: 'var(--text-main)' }}>{client.age} yrs</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.age} yrs</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Height</span>
                  <span style={{ color: 'var(--text-main)' }}>{client.height}</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.height}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Income</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{client.income} LPA</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{candidate.income} LPA</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span style={{ color: 'var(--text-main)' }}>{client.city}</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.city}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Religion / Caste</span>
                  <span style={{ color: 'var(--text-main)' }}>{client.religion} ({client.caste})</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.religion} ({candidate.caste})</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Diet</span>
                  <span style={{ color: 'var(--text-main)' }}>{client.diet}</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.diet}</span>
                </div>

                {client.religion === 'Hindu' && candidate.religion === 'Hindu' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Astro Details</span>
                    <span style={{ color: 'var(--text-main)' }}>{client.manglikStatus === 'Yes' ? 'Manglik' : 'Non-Manglik'}</span>
                    <span style={{ color: 'var(--text-main)' }}>{candidate.manglikStatus === 'Yes' ? 'Manglik' : 'Non-Manglik'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Compatibility Breakdown */}
            <div className="glass-panel match-scores-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.45)' }}>
              <div className="compatibility-score-hero">
                <div className="score-circle-large">
                  <span className="num">{matchResult.score}%</span>
                  <span className="lbl">Fit</span>
                </div>
                <div className="score-hero-text">
                  <h4>Compatibility Score</h4>
                  <p>Based on {client.gender === 'Male' ? 'traditional male' : 'thoughtful female'} matchmaking filters.</p>
                </div>
              </div>

              <div className="breakdown-list">
                {Object.entries(matchResult.breakdown).map(([key, value]) => (
                  <div className="breakdown-row" key={key}>
                    <span className="breakdown-label">{formatBreakdownName(key)}</span>
                    <div className="breakdown-bar-wrapper">
                      <div className="breakdown-bar-fill" style={{ width: `${value * 10}%` }}></div>
                    </div>
                    <span className="breakdown-score">{value * 10}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Assessment Panel */}
          <div className="ai-assessment-panel" style={{ marginBottom: '24px' }}>
            {aiLoading ? (
              <div className="ai-loading-container">
                <div className="ai-spinner"></div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generating comprehensive compatibility write-up...</p>
              </div>
            ) : (
              <div className="ai-content animate-fade-in">
                {renderMarkdown(aiAnalysis)}
              </div>
            )}
          </div>

          {/* Candidate Detailed Biodata Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1rem', marginBottom: '16px', borderBottom: '1px solid rgba(255, 74, 122, 0.15)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Full Biodata Details
            </h4>
            
            <div className="biodata-grid">
              <div className="glass-panel biodata-card">
                <h4><Calendar size={16} /> Personal Details</h4>
                <div className="biodata-fields">
                  <div className="bio-field">
                    <span className="bio-field-label">Name</span>
                    <span className="bio-field-value">{candidate.firstName} {candidate.lastName}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Gender</span>
                    <span className="bio-field-value">{candidate.gender}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">DOB / Age</span>
                    <span className="bio-field-value">{candidate.dob} ({candidate.age} yrs)</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Height</span>
                    <span className="bio-field-value">{candidate.height}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Marital Status</span>
                    <span className="bio-field-value">{candidate.maritalStatus}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Languages</span>
                    <span className="bio-field-value">{candidate.languagesKnown.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel biodata-card">
                <h4><Award size={16} /> Career & Education</h4>
                <div className="biodata-fields">
                  <div className="bio-field">
                    <span className="bio-field-label">Degree</span>
                    <span className="bio-field-value">{candidate.degree}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">College</span>
                    <span className="bio-field-value">{candidate.undergradCollege}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Designation</span>
                    <span className="bio-field-value">{candidate.designation}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Company</span>
                    <span className="bio-field-value">{candidate.currentCompany}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Annual Income</span>
                    <span className="bio-field-value highlight" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <IndianRupee size={12} /> {candidate.income} LPA
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-panel biodata-card">
                <h4><MapPin size={16} /> Location & Preferences</h4>
                <div className="biodata-fields">
                  <div className="bio-field">
                    <span className="bio-field-label">City</span>
                    <span className="bio-field-value">{candidate.city}, {candidate.country}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Diet</span>
                    <span className="bio-field-value">{candidate.diet}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Relocate?</span>
                    <span className="bio-field-value">{candidate.openToRelocate}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Kids?</span>
                    <span className="bio-field-value">{candidate.wantKids}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Pets?</span>
                    <span className="bio-field-value">{candidate.openToPets}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Smoke / Drink</span>
                    <span className="bio-field-value">S: {candidate.smoke} | D: {candidate.drink}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel biodata-card">
                <h4>✦ Cultural & Family</h4>
                <div className="biodata-fields">
                  <div className="bio-field">
                    <span className="bio-field-label">Religion</span>
                    <span className="bio-field-value">{candidate.religion}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Caste</span>
                    <span className="bio-field-value">{candidate.caste}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Gothra / Nakshatra</span>
                    <span className="bio-field-value">{candidate.gothra} / {candidate.nakshatra}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Manglik?</span>
                    <span className="bio-field-value">{candidate.manglikStatus}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Family Setup</span>
                    <span className="bio-field-value">{candidate.familyStatus} | {candidate.familyType}</span>
                  </div>
                  <div className="bio-field">
                    <span className="bio-field-label">Siblings</span>
                    <span className="bio-field-value">{candidate.siblings}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-text-box">
              <h4>About {candidate.firstName}:</h4>
              <p>&ldquo;{candidate.aboutMe}&rdquo;</p>
              <div className="hobbies-row">
                {candidate.hobbies.map((h, idx) => (
                  <span key={idx} className="hobby-pill">#{h}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary animate-pulse" onClick={onOpenPitch}>
            <Send size={16} />
            <span>Send Match Pitch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
