import React from 'react';
import { MapPin, Award, User, IndianRupee } from 'lucide-react';
import { Client } from '../../types';

interface ClientDetailsProps {
  client: Client;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
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

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="profile-hero">
        <div className="profile-avatar-large">
          {getInitials(client.firstName, client.lastName)}
        </div>
        <div className="profile-hero-info">
          <div className="profile-name-row">
            <h2>{client.firstName} {client.lastName}</h2>
            <span className={`status-badge ${getStatusClass(client.status)}`}>
              {client.status}
            </span>
          </div>
          <p className="profile-subtitle">
            {client.age} yrs • {client.designation} at {client.currentCompany} • {client.city}, {client.country}
          </p>
          <div className="profile-badge-row">
            <span className="badge-tag">Religion: {client.religion}</span>
            <span className="badge-tag">Caste: {client.caste}</span>
            <span className="badge-tag">Diet: {client.diet}</span>
            <span className="badge-tag">Family Values: {client.familyValues}</span>
            <span className="badge-tag" style={{ border: '1px solid rgba(229,169,59,0.3)', color: 'var(--color-accent)' }}>
              Horoscope Importance: {client.horoscopeImportance}
            </span>
          </div>
        </div>
      </div>

      {/* Biodata Grid */}
      <div className="biodata-grid">
        <div className="glass-panel biodata-card">
          <h4><User size={16} /> Personal Details</h4>
          <div className="biodata-fields">
            <div className="bio-field">
              <span className="bio-field-label">Gender</span>
              <span className="bio-field-value">{client.gender}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">DOB</span>
              <span className="bio-field-value">{client.dob}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Height</span>
              <span className="bio-field-value">{client.height}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Marital Status</span>
              <span className="bio-field-value">{client.maritalStatus}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Languages</span>
              <span className="bio-field-value">{client.languagesKnown.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel biodata-card">
          <h4><Award size={16} /> Education & Career</h4>
          <div className="biodata-fields">
            <div className="bio-field">
              <span className="bio-field-label">Degree</span>
              <span className="bio-field-value">{client.degree}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Undergrad College</span>
              <span className="bio-field-value">{client.undergradCollege}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Designation</span>
              <span className="bio-field-value">{client.designation}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Current Company</span>
              <span className="bio-field-value">{client.currentCompany}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Annual Income</span>
              <span className="bio-field-value highlight" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <IndianRupee size={12} /> {client.income} LPA
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel biodata-card">
          <h4><MapPin size={16} /> Location & Preferences</h4>
          <div className="biodata-fields">
            <div className="bio-field">
              <span className="bio-field-label">City, Country</span>
              <span className="bio-field-value">{client.city}, {client.country}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Dietary Preference</span>
              <span className="bio-field-value">{client.diet}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Open to Relocate?</span>
              <span className="bio-field-value">{client.openToRelocate}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Want Kids?</span>
              <span className="bio-field-value">{client.wantKids}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Open to Pets?</span>
              <span className="bio-field-value">{client.openToPets}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Smoke / Drink</span>
              <span className="bio-field-value">S: {client.smoke} | D: {client.drink}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel biodata-card">
          <h4>✦ Cultural & Family</h4>
          <div className="biodata-fields">
            <div className="bio-field">
              <span className="bio-field-label">Religion</span>
              <span className="bio-field-value">{client.religion}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Caste</span>
              <span className="bio-field-value">{client.caste}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Gothra / Nakshatra</span>
              <span className="bio-field-value">{client.gothra} / {client.nakshatra}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Manglik Status</span>
              <span className="bio-field-value">{client.manglikStatus}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Family Setup</span>
              <span className="bio-field-value">{client.familyStatus} | {client.familyType}</span>
            </div>
            <div className="bio-field">
              <span className="bio-field-label">Siblings</span>
              <span className="bio-field-value">{client.siblings}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="about-text-box">
        <h4>About {client.firstName}:</h4>
        <p>&ldquo;{client.aboutMe}&rdquo;</p>
        <div className="hobbies-row" style={{ marginTop: '12px' }}>
          {client.hobbies.map((h, idx) => (
            <span key={idx} className="hobby-pill">#{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
