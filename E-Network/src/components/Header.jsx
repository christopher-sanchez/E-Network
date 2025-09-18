import React from 'react';
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
          <li><a href="#">Home</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">Articles</a></li>
          <li><a href="#">Matches</a></li>
          <li><a href="#">Predictions</a></li>
          <li><a href="#">Settings</a></li>
          <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
