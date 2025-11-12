import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';

const popularGames = [
  { id: 1, name: 'League of Legends' },
  { id: 26, name: 'Valorant' },
  { id: 3, name: 'Dota 2' },
  { id: 4, name: 'Counter-Strike: Global Offensive' },
  { id: 2, name: 'Overwatch' },
  { id: 10, name: 'Rocket League' },
  { id: 14, name: 'Rainbow Six Siege' },
  { id: 22, name: 'Apex Legends' },
  { id: 35, name: 'Call of Duty: Modern Warfare' },
  { id: 29, name: 'StarCraft II' },
  { id: 9, name: 'Hearthstone' },
  { id: 13, name: 'PUBG' },
  { id: 36, name: 'Street Fighter V' },
  { id: 32, name: 'Tekken 7' },
  { id: 25, name: 'Super Smash Bros. Ultimate' },
  { id: 28, name: 'Fortnite' },
  { id: 23, name: 'Arena of Valor' },
  { id: 30, name: 'Teamfight Tactics' },
  { id: 31, name: 'Magic: The Gathering Arena' },
  { id: 24, name: 'Free Fire' }
];

const popularLeagues = [
    { id: 4198, name: 'LEC' },
    { id: 4197, name: 'LCS' },
    { id: 293, name: 'LCK' },
    { id: 294, name: 'LPL' },
    { id: 4331, name: 'VCT Americas' },
    { id: 4332, name: 'VCT EMEA' },
    { id: 4333, name: 'VCT Pacific' },
    { id: 4473, name: 'VCT China' },
    { id: 4259, name: 'The International' },
    { id: 4260, name: 'ESL One' },
    { id: 4243, name: 'BLAST Premier' },
    { id: 4152, name: 'Intel Extreme Masters' },
    { id: 4208, name: 'Overwatch League' },
    { id: 4252, name: 'Rocket League Championship Series' },
    { id: 4248, name: 'Six Invitational' },
    { id: 4395, name: 'Apex Legends Global Series' },
    { id: 4209, name: 'Call of Duty League' },
    { id: 4249, name: 'Evolution Championship Series (EVO)'},
    { id: 4160, name: 'PUBG Global Championship' },
    { id: 4172, name: 'Free Fire World Series' }
];

const popularOrgs = [
    { id: 10, name: 'Team Liquid' },
    { id: 3, name: 'Fnatic' },
    { id: 1, name: 'G2 Esports' },
    { id: 2, name: 'Cloud9' },
    { id: 7, name: 'T1' },
    { id: 602, name: 'Natus Vincere' },
    { id: 8, name: 'Team SoloMid (TSM)' },
    { id: 15, name: 'FaZe Clan' },
    { id: 5, name: 'Evil Geniuses' },
    { id: 12, name: '100 Thieves' },
    { id: 6, name: 'Team Secret' },
    { id: 4, name: 'Virtus.pro' },
    { id: 9, name: 'OG' },
    { id: 16, name: 'Sentinels' },
    { id: 11, name: 'NRG Esports' },
    { id: 39, name: 'Gen.G' },
    { id: 18, name: 'Ninjas in Pyjamas' },
    { id: 30, name: 'Paper Rex' },
    { id: 25, name: 'LOUD' },
    { id: 13, name: 'Astralis' }
];

function Profile() {
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
          const prefsDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
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
            {popularLeagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="teams-select">Favorite Orgs</label>
          <select 
            multiple 
            id="teams-select" 
            value={selectedTeams} 
            onChange={(e) => handleSelectChange(e, setSelectedTeams)} 
            className="multi-select">
            {popularOrgs.map(team => (
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
