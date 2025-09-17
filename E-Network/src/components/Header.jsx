import React from 'react';
import './Header.css';

function Header() {
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
        </ul>
      </nav>
    </header>
  );
}

export default Header;