import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMatchDetails } from '../utils/api';
import './MatchDetails.css';

const MatchDetails = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMatchDetails = async () => {
      try {
        const response = await fetchMatchDetails(matchId);
        setMatch(response.data);
      } catch (error) {
        console.error('Error fetching match details:', error);
      } finally {
        setLoading(false);
      }
    };

    getMatchDetails();
  }, [matchId]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!match) {
    return <div className="error-container">Match not found.</div>;
  }

  // Safely access nested properties
  const leagueName = match.league?.name || 'N/A';
  const beginAt = match.begin_at ? new Date(match.begin_at).toLocaleString() : 'N/A';
  const team1 = match.opponents[0]?.opponent;
  const team2 = match.opponents[1]?.opponent;
  const playersTeam1 = team1?.players || [];
  const playersTeam2 = team2?.players || [];

  return (
    <div className="match-details-container">
      <h1 className="match-details-title">Match Details</h1>
      <div className="match-header">
        <div className="match-header-info">
          <h2>{leagueName}</h2>
          <p>{beginAt}</p>
        </div>
        <div className="match-header-teams">
          <div className="team-info">
            <img src={team1?.image_url || 'default-team-logo.png'} alt={team1?.name} />
            <h3>{team1?.name || 'Team 1'}</h3>
          </div>
          <span className="vs">vs</span>
          <div className="team-info">
            <img src={team2?.image_url || 'default-team-logo.png'} alt={team2?.name} />
            <h3>{team2?.name || 'Team 2'}</h3>
          </div>
        </div>
      </div>

      <div className="players-section">
        <h2>Players</h2>
        <div className="players-container">
          <div className="team-players">
            <h4>{team1?.name || 'Team 1'} Players</h4>
            <ul>
              {playersTeam1.length > 0 ? (
                playersTeam1.map((player) => (
                  <li key={player.id}>
                    {player.first_name} '{player.slug}' {player.last_name}
                  </li>
                ))
              ) : (
                <li>No player data available.</li>
              )}
            </ul>
          </div>
          <div className="team-players">
            <h4>{team2?.name || 'Team 2'} Players</h4>
            <ul>
              {playersTeam2.length > 0 ? (
                playersTeam2.map((player) => (
                  <li key={player.id}>
                    {player.first_name} '{player.slug}' {player.last_name}
                  </li>
                ))
              ) : (
                <li>No player data available.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MatchDetails;
