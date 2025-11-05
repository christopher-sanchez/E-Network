import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchUpcomingMatches, fetchMatchesByIds } from '../utils/api';
import './Prediction.css';

function Predictions() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPredictions, setUserPredictions] = useState({});
  const [predictionStats, setPredictionStats] = useState({ total: 0, correct: 0, incorrect: 0 });


  useEffect(() => {
    const fetchMatchesAndPredictions = async () => {
      try {
        setLoading(true);
        const matchesResponse = await fetchUpcomingMatches();
        let upcomingMatches = matchesResponse.data.filter(m => m.status === 'not_started');

        if (auth.currentUser) {
          const predictionsRef = collection(db, 'users', auth.currentUser.uid, 'predictions');
          const predictionsSnapshot = await getDocs(predictionsRef);
          const predictions = {};
          const pastMatchIds = [];

          predictionsSnapshot.forEach(doc => {
            const data = doc.data();
            predictions[doc.id] = data.predictedWinner;
            if (data.matchId) { 
              pastMatchIds.push(data.matchId);
            }
          });
          setUserPredictions(predictions);

          // Fetch results for past predictions
          if (pastMatchIds.length > 0) {
            const pastMatchesResponse = await fetchMatchesByIds(pastMatchIds);
            const pastMatches = pastMatchesResponse.data;

            let correct = 0;
            let incorrect = 0;

            pastMatches.forEach(match => {
              const prediction = predictions[match.id];
              if (prediction && match.winner_id) { 
                if (prediction === match.winner_id.toString()) {
                  correct++;
                } else {
                  incorrect++;
                }
              }
            });
            setPredictionStats({ total: pastMatchIds.length, correct, incorrect });
          }
        }

        setMatches(upcomingMatches);
      } catch (err) {
        setError('Error fetching matches or predictions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesAndPredictions();
  }, []);


  const handlePrediction = async (matchId, predictedWinner) => {
    if (!auth.currentUser) {
      alert('You must be logged in to make a prediction.');
      return;
    }

    const prediction = {
      matchId: matchId,
      predictedWinner: predictedWinner,
      predictionTime: new Date()
    };

    try {
      const predictionRef = doc(db, 'users', auth.currentUser.uid, 'predictions', matchId.toString());
      await setDoc(predictionRef, prediction);
      setUserPredictions(prev => ({ ...prev, [matchId]: predictedWinner }));
    } catch (error) {
      console.error('Error saving prediction: ', error);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">{error}</div>;

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
      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <div className="match-info">
              <span>{match.league.name}</span>
              <span>{new Date(match.begin_at).toLocaleString()}</span>
            </div>
            <div className="teams-container">
            <div className={`team ${userPredictions[match.id] === (match.opponents[0]?.opponent.id)?.toString() ? 'selected' : ''}`}>
                <img src={match.opponents[0]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[0]?.opponent.name} />
                <span>{match.opponents[0]?.opponent.name}</span>
                <button 
                    onClick={() => handlePrediction(match.id, (match.opponents[0]?.opponent.id)?.toString())}
                    disabled={!!userPredictions[match.id]}>
                    Predict
                </button>
            </div>
            <span className="vs-text">VS</span>
            <div className={`team ${userPredictions[match.id] === (match.opponents[1]?.opponent.id)?.toString() ? 'selected' : ''}`}>
                <img src={match.opponents[1]?.opponent.image_url || 'default-team-logo.png'} alt={match.opponents[1]?.opponent.name} />
                <span>{match.opponents[1]?.opponent.name}</span>
                <button 
                    onClick={() => handlePrediction(match.id, (match.opponents[1]?.opponent.id)?.toString())}
                    disabled={!!userPredictions[match.id]}>
                    Predict
                </button>
            </div>
        </div>

            {userPredictions[match.id] && (
              <div className="user-prediction">
                Your Prediction: {match.opponents.find(o => o.opponent.id.toString() === userPredictions[match.id])?.opponent.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Predictions;
