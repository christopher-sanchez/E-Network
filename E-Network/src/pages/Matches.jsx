import React, { useState, useEffect } from 'react';
import './Matches.css';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches/upcoming', {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_PANDASCORE_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Sort matches by date before setting them
        const sortedData = data.sort((a, b) => new Date(a.begin_at) - new Date(b.begin_at));
        setMatches(sortedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading matches...</div>;
  }

  if (error) {
    return <div className="error-container">Error fetching matches: {error}</div>;
  }

  return (
    <div className="matches-page-container">
      <h1>Upcoming Esports Matches</h1>
      <div className="matches-container">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-card-header">
                <strong>{match.league.name}</strong>
                <span>{match.videogame.name}</span>
              </div>
              <p className="match-name">{match.name}</p>
              <div className="teams">
                <div className="team">
                    {match.opponents[0]?.opponent.image_url && <img src={match.opponents[0].opponent.image_url} alt={match.opponents[0].opponent.name} />}
                    <span>{match.opponents[0]?.opponent.name || 'TBD'}</span>
                </div>
                <span className="vs">VS</span>
                <div className="team">
                    {match.opponents[1]?.opponent.image_url && <img src={match.opponents[1].opponent.image_url} alt={match.opponents[1].opponent.name} />}
                    <span>{match.opponents[1]?.opponent.name || 'TBD'}</span>
                </div>
              </div>
              <p className="match-time">{new Date(match.begin_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No upcoming matches found.</p>
        )}
      </div>
    </div>
  );
}

export default Matches;
