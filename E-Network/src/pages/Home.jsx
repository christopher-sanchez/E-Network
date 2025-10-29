import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchUpcomingMatches } from '../utils/api';
import './Home.css';

function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userPrefs = userDoc.exists() ? userDoc.data().preferences : null;
          setPreferences(userPrefs);

          const response = await fetchUpcomingMatches();
          let allMatches = response.data;
          let finalMatches = [];

          allMatches.sort((a, b) => new Date(a.begin_at) - new Date(b.begin_at));

          if (userPrefs && userPrefs.games?.length > 0) {
            const gameIds = userPrefs.games.map(String);
            const leagueIds = userPrefs.leagues?.map(String) || [];
            const teamIds = userPrefs.teams?.map(String) || [];

            const matchesByGame = allMatches.filter(match => gameIds.includes(String(match.videogame.id)));

            let specificMatches = [];
            if (leagueIds.length > 0 || teamIds.length > 0) {
              specificMatches = matchesByGame.filter(match => {
                const leagueMatch = leagueIds.includes(String(match.league.id));
                const teamMatch = match.opponents.some(op => teamIds.includes(String(op.opponent?.id)));
                return leagueMatch || teamMatch;
              });
            }

            if (specificMatches.length > 0) {
              finalMatches = specificMatches;
              setIsFallback(false);
            } else {
              finalMatches = matchesByGame;
              setIsFallback(true);
            }

          } else {
            finalMatches = allMatches;
            setIsFallback(true);
          }

          setMatches(finalMatches);

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setMatches([]);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading your feed...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!user) {
    return <div>Please log in to see your personalized feed.</div>;
  }

  if (!preferences || !preferences.games?.length) {
    return (
      <div className="home-container empty-feed">
        <h2>Welcome to E-Network!</h2>
        <p>You haven't selected any favorite games yet. Visit your profile to get started.</p>
        <Link to="/profile" className="button-link">Go to Profile</Link>
      </div>
    );
  }

  const placeholder_img = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

  return (
    <div className="home-container">
      <h2>Your Upcoming Matches</h2>
      {isFallback && matches.length > 0 && <p className="fallback-message">No specific matches found for your leagues/teams. Showing all upcoming matches for your favorite games instead.</p>}
      {matches.length > 0 ? (
        <ul className="match-list">
          {matches.map(match => (
            <li key={match.id} className="match-item">
              <div className="match-header">
                <strong>{match.league.name}</strong> - <span>{match.videogame.name}</span>
              </div>
              <div className="match-details">
                <div className="team">
                    <img src={match.opponents[0]?.opponent.image_url || placeholder_img} alt={match.opponents[0]?.opponent.name} className="team-logo" />
                    <span>{match.opponents[0]?.opponent.name || 'TBD'}</span>
                </div>
                <span className="vs">vs</span>
                <div className="team">
                    <img src={match.opponents[1]?.opponent.image_url || placeholder_img} alt={match.opponents[1]?.opponent.name} className="team-logo" />
                    <span>{match.opponents[1]?.opponent.name || 'TBD'}</span>
                </div>
              </div>
              <div className="match-time">
                {new Date(match.begin_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming matches found based on your preferences.</p>
      )}
    </div>
  );
}

export default Home;
