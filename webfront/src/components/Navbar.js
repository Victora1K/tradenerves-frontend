// File: Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ totalAccountValue }) => {
  return (
    <nav style={navbarStyle}>
      <h2 style={logoStyle}>Tradenerves</h2>
      <div style={navLinksStyle}>
        <Link to="/" style={linkStyle}>Trade</Link>
        <Link to="/patterns" style={linkStyle}>Patterns</Link>
        <Link to="/events" style={linkStyle}>Events</Link>
        <Link to="/practice" style={linkStyle}>Practice</Link>
      </div>
      <h3 style={accountStyle}>Account Value: ${totalAccountValue.toFixed(2)}</h3>
    </nav>
  );
};

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#333',
  color: 'white',
  width: '100%',
  overflow: 'auto',
  margin: '0px 0px 5px 0px',
  padding: '5px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 999,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#333',
  color: 'white',
  width: '100%',
  overflow: 'auto',
  margin: '0px 0px 5px 0px',
  padding: '5px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 999,
};

const logoStyle = {
  margin: 0,
  padding: '0 10px',
};

const navLinksStyle = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '5px 10px',
};

const accountStyle = {
  margin: 0,
  padding: '0 10px',
};

export default Navbar;
