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
        setMatches(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <div>Loading matches...</div>;
  }

  if (error) {
    return <div>Error fetching matches: {error}</div>;
  }

  return (
    <div>
      <h1>Upcoming Esports Matches</h1>
      <div className="matches-container">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="match-card">
              <h2>{match.name}</h2>
              <p><strong>League:</strong> {match.league.name}</p>
              <p><strong>Game:</strong> {match.videogame.name}</p>
              <p><strong>Time:</strong> {new Date(match.scheduled_at).toLocaleString()}</p>
              <div className="teams">
                <div className="team">
                    {match.opponents[0] && <img src={match.opponents[0].opponent.image_url} alt={match.opponents[0].opponent.name} />}
                    <span>{match.opponents[0] ? match.opponents[0].opponent.name : 'TBD'}</span>
                </div>
                <span className="vs">VS</span>
                <div className="team">
                    {match.opponents[1] && <img src={match.opponents[1].opponent.image_url} alt={match.opponents[1].opponent.name} />}
                    <span>{match.opponents[1] ? match.opponents[1].opponent.name : 'TBD'}</span>
                </div>
              </div>
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
