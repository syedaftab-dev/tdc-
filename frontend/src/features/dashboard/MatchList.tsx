import React, { useState, useMemo } from 'react';
import { Search, MapPin, IndianRupee, Eye, Send, Sparkles } from 'lucide-react';
import { Client, Profile, MatchScoreResult } from '../../types';
import { calculateMatchScore } from '../../services/matchEngine';

interface MatchListProps {
  client: Client;
  pool: Profile[];
  onSelectCandidate: (candidate: Profile, result: MatchScoreResult) => void;
  onSendPitchDirect: (candidate: Profile, result: MatchScoreResult) => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  client,
  pool,
  onSelectCandidate,
  onSendPitchDirect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [religionFilter, setReligionFilter] = useState('');
  const [dietFilter, setDietFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'income' | 'age'>('score');

  // Filter pool by opposite gender and compute score for each candidate
  const scoredCandidates = useMemo(() => {
    return pool
      .filter((p) => p.gender !== client.gender)
      .map((candidate) => {
        const matchResult = calculateMatchScore(client, candidate);
        return {
          candidate,
          matchResult,
        };
      });
  }, [client, pool]);

  // Apply filters and sorting
  const filteredAndSortedCandidates = useMemo(() => {
    let result = scoredCandidates.filter(({ candidate }) => {
      // 1. Search Query (Name, college, company, designation)
      const query = searchQuery.toLowerCase();
      const nameMatch = `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(query);
      const companyMatch = candidate.currentCompany.toLowerCase().includes(query);
      const designationMatch = candidate.designation.toLowerCase().includes(query);
      const collegeMatch = candidate.undergradCollege.toLowerCase().includes(query);
      
      const matchesSearch = nameMatch || companyMatch || designationMatch || collegeMatch;

      // 2. Religion Filter
      const matchesReligion = religionFilter ? candidate.religion === religionFilter : true;

      // 3. Diet Filter
      const matchesDiet = dietFilter ? candidate.diet === dietFilter : true;

      // 4. City Filter
      const matchesCity = cityFilter ? candidate.city === cityFilter : true;

      return matchesSearch && matchesReligion && matchesDiet && matchesCity;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'score') {
        return b.matchResult.score - a.matchResult.score;
      }
      if (sortBy === 'income') {
        return b.candidate.income - a.candidate.income;
      }
      if (sortBy === 'age') {
        return a.candidate.age - b.candidate.age; // younger first
      }
      return 0;
    });

    return result;
  }, [scoredCandidates, searchQuery, religionFilter, dietFilter, cityFilter, sortBy]);

  // Get unique cities in opposite gender pool for filters
  const uniqueCities = useMemo(() => {
    const cities = pool
      .filter((p) => p.gender !== client.gender)
      .map((p) => p.city);
    return Array.from(new Set(cities)).sort();
  }, [pool, client]);

  return (
    <div className="animate-fade-in">
      {/* Search and Filter Panel */}
      <div className="match-pool-header">
        <h3>Matchmaker Pool ({filteredAndSortedCandidates.length} potential matches)</h3>
        
        <div className="pool-filters">
          <div className="search-input-wrapper" style={{ width: '220px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search candidate..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={religionFilter}
            onChange={(e) => setReligionFilter(e.target.value)}
          >
            <option value="">All Religions</option>
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
            <option value="Sikh">Sikh</option>
            <option value="Christian">Christian</option>
            <option value="Jain">Jain</option>
          </select>

          <select
            className="filter-select"
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
          >
            <option value="">All Diets</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Jain">Jain</option>
            <option value="Vegan">Vegan</option>
          </select>

          <select
            className="filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="score">Sort by Fit Score</option>
            <option value="income">Sort by Income</option>
            <option value="age">Sort by Age</option>
          </select>
        </div>
      </div>

      {/* Grid of Matches */}
      {filteredAndSortedCandidates.length === 0 ? (
        <div className="empty-state glass-panel" style={{ padding: '60px' }}>
          <Sparkles className="empty-state-icon" />
          <h3>No matching profiles found</h3>
          <p>Try clearing some filters or broaden your search queries.</p>
        </div>
      ) : (
        <div className="match-grid">
          {filteredAndSortedCandidates.map(({ candidate, matchResult }) => (
            <div className="glass-panel match-card animate-fade-in" key={candidate.id}>
              {/* Score Badge */}
              <div className="match-score-badge">
                <span className="match-score-num">{matchResult.score}%</span>
                <span className="match-score-lbl">Fit</span>
              </div>

              {/* Header Info */}
              <div className="match-top">
                <h4 className="match-name">
                  {candidate.firstName} {candidate.lastName}
                </h4>
                <div className="match-profession">
                  {candidate.designation} at {candidate.currentCompany}
                </div>
              </div>

              {/* Core Attributes */}
              <div className="match-brief-details">
                <div className="match-brief-item">
                  <span style={{ color: 'var(--text-muted)' }}>Age:</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.age} yrs</span>
                </div>
                <div className="match-brief-item">
                  <MapPin size={12} />
                  <span>{candidate.city}</span>
                </div>
                <div className="match-brief-item">
                  <span style={{ color: 'var(--text-muted)' }}>Height:</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.height}</span>
                </div>
                <div className="match-brief-item">
                  <IndianRupee size={12} />
                  <span>{candidate.income} LPA</span>
                </div>
                <div className="match-brief-item" style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Relig:</span>
                  <span style={{ color: 'var(--text-main)' }}>{candidate.religion} ({candidate.caste})</span>
                </div>
              </div>

              {/* Reasons preview */}
              <div className="match-reasons-preview">
                {matchResult.reasons.length > 0 ? (
                  <span>★ {matchResult.reasons[0]} {matchResult.reasons[1] ? `| ${matchResult.reasons[1]}` : ''}</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No special matches flagged, basic alignment checked.</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="match-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelectCandidate(candidate, matchResult)}
                >
                  <Eye size={14} />
                  <span>Compare</span>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onSendPitchDirect(candidate, matchResult)}
                >
                  <Send size={14} />
                  <span>Send Pitch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
