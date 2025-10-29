import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchLeagues, fetchTeams } from '../utils/api'; 
import './Profile.css';

const popularGames = [
  { id: 1, name: 'League of Legends' },
  { id: 26, name: 'Valorant' },
  { id: 3, name: 'Dota 2' },
  { id: 4, name: 'Counter-Strike: Global Offensive' },
  { id: 2, name: 'Overwatch' },
];

function Profile() {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const [prefsDoc, leaguesResponse, teamsResponse] = await Promise.all([
            getDoc(doc(db, 'users', currentUser.uid)),
            fetchLeagues(),
            fetchTeams()
          ]);
          
          setLeagues(leaguesResponse.data);
          setTeams(teamsResponse.data);

          if (prefsDoc.exists()) {
            const prefs = prefsDoc.data().preferences || {};
            setSelectedGames(prefs.games || []);
            setSelectedLeagues(prefs.leagues || []);
            setSelectedTeams(prefs.teams || []);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) {
      setMessage('You must be logged in to save preferences.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        preferences: { 
          games: selectedGames, 
          leagues: selectedLeagues, 
          teams: selectedTeams 
        }
      }, { merge: true });
      setMessage('Preferences saved!');
    } catch (error) {
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSelectChange = (event, setter) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => Number(option.value));
    setter(selectedOptions);
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>

  return (
    <div className="profile-container">
      <form className="preferences-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Set Your Preferences</h2>
        <p>Select the games, leagues, and teams you want to follow. Your feed will be personalized based on your selections. Hold Ctrl/Cmd to select multiple options.</p>

        <div className="select-group">
          <label htmlFor="games-select">Favorite Games</label>
          <select 
            multiple 
            id="games-select" 
            value={selectedGames} 
            onChange={(e) => handleSelectChange(e, setSelectedGames)} 
            className="multi-select">
            {popularGames.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="leagues-select">Favorite Leagues</label>
          <select 
            multiple 
            id="leagues-select" 
            value={selectedLeagues} 
            onChange={(e) => handleSelectChange(e, setSelectedLeagues)} 
            className="multi-select">
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="teams-select">Favorite Teams</label>
          <select 
            multiple 
            id="teams-select" 
            value={selectedTeams} 
            onChange={(e) => handleSelectChange(e, setSelectedTeams)} 
            className="multi-select">
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {message && <p className="message">{message}</p>}
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
