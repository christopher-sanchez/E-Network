import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Header.css';

function Header() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <header className="header">
      <div className="logo">E-Network</div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/articles">Articles</Link></li>
          <li><Link to="/matches">Matches</Link></li>
          <li><Link to="/predictions">Predictions</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
