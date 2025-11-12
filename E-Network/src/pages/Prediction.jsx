import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchUpcomingMatches, fetchMatchesByIds } from '../utils/api';
import './Prediction.css';

function Predictions() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPredictions, setUserPredictions] = useState({});
  const [predictionStats, setPredictionStats] = useState({ total: 0, correct: 0, incorrect: 0 });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState({}); // For staging predictions

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        setUserPredictions({});
        setPredictionHistory([]);
        setPredictionStats({ total: 0, correct: 0, incorrect: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const upcomingMatchesResponse = await fetchUpcomingMatches();
        setMatches(upcomingMatchesResponse.data);

        if (user) {
          const predictionsRef = doc(db, 'predictions', user.uid);
          const predictionsSnap = await getDoc(predictionsRef);

          if (predictionsSnap.exists()) {
            const predictionsData = predictionsSnap.data();
            setUserPredictions(predictionsData);

            const predictedMatchIds = Object.keys(predictionsData);
            if (predictedMatchIds.length > 0) {
              const predictedMatchesResponse = await fetchMatchesByIds(predictedMatchIds);
              const predictedMatches = predictedMatchesResponse.data;

              const history = [];
              let correct = 0;
              predictedMatches.forEach(match => {
                if (match.status === 'finished') {
                  history.push(match);
                  if (predictionsData[match.id] && predictionsData[match.id].toString() === match.winner_id?.toString()) {
                    correct++;
                  }
                }
              });

              setPredictionHistory(history);
              const totalFinished = history.length;
              const incorrect = totalFinished - correct;
              setPredictionStats({ total: totalFinished, correct, incorrect });
            }
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

  }, [user]);

  const handleSelectTeam = (matchId, teamId) => {
    if (userPredictions[matchId]) return; // Don't allow changing selection after prediction
    setSelectedTeams(prev => ({
      ...prev,
      [matchId]: teamId,
    }));
  };

  const handlePrediction = async (matchId) => {
    if (!auth.currentUser) {
      alert("Please login to make predictions.");
      return;
    }

    const predictedTeamId = selectedTeams[matchId];
    if (!predictedTeamId) {
        alert("Please select a team first.");
        return;
    }

    const newPredictions = {
      ...userPredictions,
      [matchId]: predictedTeamId?.toString()
    };
    setUserPredictions(newPredictions);

    try {
      await setDoc(doc(db, "predictions", auth.currentUser.uid), {
        [matchId]: predictedTeamId?.toString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving prediction: ", error);
      alert("There was an error saving your prediction.");
      // Revert optimistic UI update on error
      const revertedPredictions = { ...userPredictions };
      delete revertedPredictions[matchId];
      setUserPredictions(revertedPredictions);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
      <div className="predictions-container">
        <h2>Upcoming Matches</h2>
        {auth.currentUser && (
          <div className="prediction-stats">
            <h3>Prediction Stats</h3>
            <p>Total Predictions: {predictionStats.total}</p>
            <p>Correct: {predictionStats.correct}</p>
            <p>Incorrect: {predictionStats.incorrect}</p>
          </div>
        )}
        <div className="tabs">
            <button className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
            <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
        </div>
        {activeTab === 'upcoming' && (
            <div className="matches-grid">
                {matches.map(match => {
                  const hasPredicted = userPredictions[match.id];
                  const selection = selectedTeams[match.id];
                  return (
                    <div key={match.id} className="match-card">
                        <div className="match-info">
                        <span>{match.league.name}</span>
                        <span>{new Date(match.begin_at).toLocaleString()}</span>
                        </div>
                        <div className="teams-container">
                          <div className={`team ${ (hasPredicted && userPredictions[match.id] === (match.opponents[0]?.opponent.id)?.toString()) || (!hasPredicted && selection === match.opponents[0]?.opponent.id) ? 'selected' : ''}`}>
                              <img src={match.opponents[0]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[0]?.opponent.name} onClick={() => handleSelectTeam(match.id, match.opponents[0]?.opponent.id)} />
                              <span>{match.opponents[0]?.opponent.name}</span>
                          </div>
                          <span className="vs-text">vs</span>
                          <div className={`team ${ (hasPredicted && userPredictions[match.id] === (match.opponents[1]?.opponent.id)?.toString()) || (!hasPredicted && selection === match.opponents[1]?.opponent.id) ? 'selected' : ''}`}>
                              <img src={match.opponents[1]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[1]?.opponent.name} onClick={() => handleSelectTeam(match.id, match.opponents[1]?.opponent.id)} />
                              <span>{match.opponents[1]?.opponent.name}</span>
                          </div>
                        </div>
                        {hasPredicted ? (
                          <div className="user-prediction">
                              Your Prediction: {match.opponents.find(o => o.opponent.id.toString() === userPredictions[match.id])?.opponent.name}
                          </div>
                        ) : (
                          <button className="predict-button" disabled={!selection} onClick={() => handlePrediction(match.id)}>
                              Predict
                          </button>
                        )}
                    </div>
                  );
                })}
            </div>
        )}
        {activeTab === 'history' && (
            <div className="prediction-history">
                <h3>Prediction History</h3>
                {predictionHistory.length > 0 ? (
                    <div className="matches-grid">
                    {predictionHistory.map(match => (
                        <div key={match.id} className="match-card">
                            <div className="match-info">
                                <span>{match.league.name}</span>
                                <span>{new Date(match.begin_at).toLocaleString()}</span>
                            </div>
                            <div className="teams-container">
                                <div className="team">
                                    <img src={match.opponents[0]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[0]?.opponent.name} />
                                    <span>{match.opponents[0]?.opponent.name}</span>
                                </div>
                                <span className="vs-text">vs</span>
                                <div className="team">
                                    <img src={match.opponents[1]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[1]?.opponent.name} />
                                    <span>{match.opponents[1]?.opponent.name}</span>
                                </div>
                            </div>
                           
                            <div className="match-result">
                                Winner: {match.winner?.name || 'TBD'}
                            </div>
                            <div className={`prediction-outcome ${userPredictions[match.id]?.toString() === match.winner_id?.toString() ? 'correct' : 'incorrect'}`}>
                                {userPredictions[match.id]?.toString() === match.winner_id?.toString() ? 'Correct' : 'Incorrect'}
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p>No prediction history found.</p>
                )}
            </div>
        )}
      </div>
    );
  }
  
  export default Predictions;