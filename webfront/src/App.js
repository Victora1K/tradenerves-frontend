import logo from './logo.svg';
import './App.css';
import Dashboard from './components/Dashboard';
import Events from './components/Events';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PatternsInfo from './components/PatternsInfo';
import Navbar from './components/Navbar';
import React, { useState } from 'react';
import { TradingProvider } from './context/TradingContext';
import Practice from './components/Practice';

function App() {
  const [totalAccountValue, setTotalAccountValue] = useState(10000);
  
  return (
    <TradingProvider>
      <Router>
        <Navbar totalAccountValue={totalAccountValue} />


          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  setTotalAccountValue={setTotalAccountValue} 
                  totalAccountValue={totalAccountValue} 
                />
              } 
            />
            <Route path="/events" element={<Events />} />
            <Route path="/patterns" element={<PatternsInfo />} />
            <Route 
              path="/practice" 
              element={
                <Practice 
                  setTotalAccountValue={setTotalAccountValue} 
                  totalAccountValue={totalAccountValue} 
                />
              } 
            />
          </Routes>
     
      </Router>
    </TradingProvider>
  );
}

export default App;
