// File: Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
//import hammer from '../image-patterns/hammer.ico';

const Navbar = ({ totalAccountValue }) => {
  
  return (
    <nav className='Navbar' style={navbarStyle}>
      <h2 style={logoStyle}>Tradenerves</h2>
      <div style={navLinksStyle}>
        <ul>
          <li>
          <Link to="/" className="nav-link" style={linkStyle}>Trade</Link>
          </li>
          <li>
          <Link to="/patterns" className="nav-link" style={linkStyle}>Patterns</Link>
          </li>
          <li>
          <Link to="/events" className="nav-link" style={linkStyle}>Events</Link>
          </li>
          <li>
          <Link to="/practice" className="nav-link" style={linkStyle}>Practice</Link>
          </li>

        </ul>
      </div>
      <h3 className='account' style={accountStyle}>Account Value: ${totalAccountValue.toFixed(2)}</h3>
    </nav>
  );
};

const navbarStyle = {

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
  padding: '5px 15px 10px 10px' ,
};

const accountStyle = {
  margin: 20,
  padding: '0 10px',
};

export default Navbar;
