import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h2>EmoCheck RH</h2>
      <div className="links">
        <Link to="/">Accueil</Link>
        <Link to="/login">Admin</Link>
        <Link to="/register">Inscription</Link>
        <Link to="/entretien">Entretien</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;
