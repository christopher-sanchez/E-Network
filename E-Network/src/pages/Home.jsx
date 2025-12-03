import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { fetchUpcomingMatches } from '../utils/api';
import '../components/MatchCard.css'; // Import shared CSS
import './Home.css'; // Import page-specific CSS

function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.emailVerified) {
          setShowVerificationMessage(true);
        } else {
          setShowVerificationMessage(false);
        }
        setWelcomeMessage(currentUser.displayName ? `Welcome back, ${currentUser.displayName}!` : 'Welcome back!');
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
        setShowVerificationMessage(false);
        setWelcomeMessage('Welcome to E-Network!');
        fetchUpcomingMatches().then(response => {
            setMatches(response.data.sort((a, b) => new Date(a.begin_at) - new Date(b.begin_at)));
        }).catch(err => {
            setError(err.message);
        }).finally(() => {
            setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert("Verification email sent!");
      } catch (error) {
        alert("Error sending verification email: " + error.message);
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your feed...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (user && (!preferences || !preferences.games?.length)) {
    return (
      <div className="home-container empty-feed">
        {showVerificationMessage && (
          <div className="verification-message">
            <p>Please verify your email address. A verification email has been sent to {user.email}.</p>
            <button onClick={handleResendVerification}>Resend Verification Email</button>
          </div>
        )}
        <h2>Welcome to E-Network!</h2>
        <p>You haven't selected any favorite games yet. Visit your profile to personalize your feed.</p>
        <Link to="/profile" className="button-link">Go to Profile</Link>
      </div>
    );
  }

  return (
    <div className="home-container">
      {showVerificationMessage && (
        <div className="verification-message">
          <p>Please verify your email address. A verification email has been sent to {user.email}.</p>
          <button onClick={handleResendVerification}>Resend Verification Email</button>
        </div>
      )}
      <h1 className="page-title">{welcomeMessage}</h1>
      <h2 className="sub-title">Your Upcoming Matches Feed</h2>
      {isFallback && user && preferences && preferences.games?.length > 0 && <p className="fallback-message">No specific matches found for your leagues/teams. Showing all upcoming matches for your favorite games instead.</p>}
      
      <div className="matches-grid">
        {matches.length > 0 ? (
          matches.map(match => (
            <Link to={`/match/${match.id}`} key={match.id} className="match-card">
              <div className="match-info">
                <span>{match.league.name}</span>
                <span>{new Date(match.begin_at).toLocaleString()}</span>
              </div>
              <div className="teams-container">
                <div className="team">
                  <img src={match.opponents[0]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[0]?.opponent.name || 'TBD'} />
                  <span>{match.opponents[0]?.opponent.name || 'TBD'}</span>
                </div>
                <span className="vs-text">vs</span>
                <div className="team">
                  <img src={match.opponents[1]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[1]?.opponent.name || 'TBD'} />
                  <span>{match.opponents[1]?.opponent.name || 'TBD'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-matches-message">No upcoming matches found based on your preferences.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
