import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Matches.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get("/api/matches/upcoming", {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PANDASCORE_TOKEN}`,
          },
        });
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-4xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="matches-page-container">
      <h1 className="text-3xl font-bold mb-4">Upcoming Matches</h1>
      <div className="matches-container">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <Link to={`/match/${match.id}`}>
              <h2 className="match-name">{match.name}</h2>
              <p className="text-gray-600">
                {new Date(match.begin_at).toLocaleString()}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
