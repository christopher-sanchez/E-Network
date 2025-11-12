import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUpcomingMatches } from "../utils/api";
import "../components/MatchCard.css";
import "./Matches.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMatches = async () => {
      try {
        // Api call stored in api.js
        const response = await fetchUpcomingMatches();
        
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    getMatches();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="matches-page-container">
      <h1 className="page-title">Upcoming Matches</h1>
      <div className="matches-grid">
        {matches.map((match) => (
          <Link to={`/match/${match.id}`} key={match.id} className="match-card">
            <div className="match-info">
              <span>{match.league.name}</span>
              <span>{new Date(match.begin_at).toLocaleString()}</span>
            </div>
            <div className="teams-container">
              <div className="team">
                <img
                  src={match.opponents[0]?.opponent.image_url || 'default-team-logo.png'}
                  alt={match.opponents[0]?.opponent.name}
                />
                <span>
                  {match.opponents[0]?.opponent.name}
                </span>
              </div>
              <span className="vs-text">vs</span>
              <div className="team">
                <img
                  src={match.opponents[1]?.opponent.image_url || 'default-team-logo.png'}
                  alt={match.opponents[1]?.opponent.name}
                />
                <span>
                  {match.opponents[1]?.opponent.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Matches;
