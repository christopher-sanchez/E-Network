import React, { useState, useEffect } from 'react';
import './Matches.css';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches/upcoming');

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        // Sort matches by date
        const sortedMatches = data.sort((a, b) => new Date(a.begin_at) - new Date(b.begin_at));
        setMatches(sortedMatches);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match => 
    (match.league.name && match.league.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (match.videogame.name && match.videogame.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (match.opponents[0]?.opponent.name && match.opponents[0].opponent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (match.opponents[1]?.opponent.name && match.opponents[1].opponent.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="loading-container">Loading matches...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="matches-container">
      <h2>Upcoming Matches</h2>
      <div className="search-container">
        <input 
          type="text"
          placeholder="Search for a game, league, or team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredMatches.length > 0 ? (
        <ul className="match-list">
          {filteredMatches.map(match => (
            <li key={match.id} className="match-item">
              <div className="match-header">
                <strong>{match.league.name}</strong> - <span>{match.videogame.name}</span>
              </div>
              <div className="match-details">
                <div className="team-logo-container">
                <img src={match.opponents[0]?.opponent.image_url || 'https://via.placeholder.com/50'} alt={match.opponents[0]?.opponent.name || 'TBD'} className="team-logo"/>
                <span className="team">{match.opponents[0]?.opponent.name || 'TBD'}</span>
                </div>
                <span className="vs">vs</span>
                <div className="team-logo-container">
                <img src={match.opponents[1]?.opponent.image_url || 'https://via.placeholder.com/50'} alt={match.opponents[1]?.opponent.name || 'TBD'} className="team-logo"/>
                <span className="team">{match.opponents[1]?.opponent.name || 'TBD'}</span>
                </div>
              </div>
              <div className="match-time">
                {new Date(match.begin_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches found.</p>
      )}
    </div>
  );
}

export default Matches;
