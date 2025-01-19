import React, { useState, useEffect } from 'react';
import CandlestickChart from './CandlestickChart';
import PatternCarousel from './PatternCarousel';
import Plot from 'react-plotly.js';
import { useTrading } from '../context/TradingContext';
import { usePlayback } from '../hooks/usePlayback';
import API from '../services/api';

const Dashboard = ({ totalAccountValue, setTotalAccountValue }) => {
  // State
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState({ dates: [], open: [], high: [], low: [], close: [], volume: [] });
  const [patternType, setPatternType] = useState('random');
  const [dayTrade, setDayTrade] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isSymbolScrambled, setIsSymbolScrambled] = useState(true);
  const [scrambledSymbol, setScrambledSymbol] = useState('');

  // Custom hooks
  const { state: tradingState, dispatch: tradingDispatch } = useTrading();
  const { 
    displayData, 
    currentIndex,
    isPlaying,
    playSpeed,
    controls: playbackControls
  } = usePlayback(stockData);

  // Theme and Layout
  const darkThemeLayout = {
    title: {
      text: `${isSymbolScrambled ? scrambledSymbol : symbol} Candlestick Chart`,
      font: { color: '#FFFFFF' },
    },
    xaxis: {
      title: 'Date',
      color: '#FFFFFF',
      tickfont: { color: '#FFFFFF' },
      gridcolor: '#444444',
      rangeslider: { visible: false },
    },
    yaxis: {
      title: 'Price',
      color: '#FFFFFF',
      tickfont: { color: '#FFFFFF' },
      gridcolor: '#444444',
    },
    grid: {
      pattern: 'Independent',
      rows: 2,
      columns: 1,
    },
    subplots:[['x','y'], ['x2','y2']],
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: '#1e1e1e',
    plot_bgcolor: '#222222',
    showlegend: false,
    bordercolor: '#FFFFFF',
    borderwidth: 2,
  };

  const lightThemeLayout = {
    title: {
      text: `${isSymbolScrambled ? scrambledSymbol : symbol} Candlestick Chart`,
      font: { color: '#000000' },
    },
    xaxis: {
      color: '#000000',
      domain: [0,1],
      anchor: 'y',
      tickfont: { color: '#000000' },
      gridcolor: '#e0e0e0',
      rangeslider: { visible: false },
    },
    yaxis: {
      title: 'Price',
      color: '#000000',
      domain: [0.25,1],
      anchor: 'x',
      tickfont: { color: '#000000' },
      gridcolor: '#e0e0e0',
    },
    xaxis2: {
      title: 'Date',
      color: '#000000',
      domain: [0,1],
      anchor: 'y2',
      tickfont: { color: '#000000' },
      gridcolor: '#e0e0e0',
      rangeslider: { visible: false },
    },
    yaxis2: {
      title: 'Volume',
      color: '#000000',
      domain: [0,0.2],
      anchor: 'x2',
      tickfont: { color: '#000000' },
      gridcolor: '#e0e0e0',
    },
    grid: {
      pattern: 'Independent',
      rows: 2,
      columns: 1,
    },
    subplots:[['x','y'], ['x2','y2']],
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: '#f4f4f4',
    plot_bgcolor: '#ffffff',
    showlegend: false,
    bordercolor: '#000000',
    borderwidth: 2,
  };

  // Styles
  const styles = {
    edge: {
      margin: '0px',
      padding: '0px',
    },
    headerText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    chart: {
      width: '90%',
      display: 'flex',
      height: '60%',
      maxHeight: '700px'
    },
  };



  // Helper functions
  function generateSymbol() {
    const randLetters = ['A', 'B', 'X', 'D', 'O', 'F', 'G', 'H', 'V', 'J'];
    return Array(3).fill(0).map(() => 
      randLetters[Math.floor(Math.random() * 10)]).join('');
  }

  const filterTradingDays = (data) => {
    if (!data || !data.dates) return data;
    
    const filtered = {
        dates: [],
        open: [],
        high: [],
        low: [],
        close: [],
        volume: []
    };
    
    data.dates.forEach((date, i) => {
        const dayOfWeek = new Date(date).getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && 
            data.open[i] && data.high[i] && 
            data.low[i] && data.close[i]) {
            filtered.dates.push(date);
            filtered.open.push(data.open[i]);
            filtered.high.push(data.high[i]);
            filtered.low.push(data.low[i]);
            filtered.close.push(data.close[i]);
            filtered.volume.push(data.volume[i] || 0);
        }
    });
    return filtered;
};

  // Trading functions
  const enterPosition = (multiplier = 1) => {
    if (currentIndex > 1 && displayData.close.length > currentIndex - 1) {
      const entryPrice = displayData.close[currentIndex - 1];
      tradingDispatch({
        type: 'ENTER_POSITION',
        payload: { shares: multiplier, price: entryPrice }
      });
    }
  };

  const shortPosition = (multiplier = 1) => {
    if (currentIndex > 1 && displayData.close.length > currentIndex - 1) {
      const entryPrice = displayData.close[currentIndex - 1];
      tradingDispatch({
        type: 'SHORT_POSITION',
        payload: { shares: multiplier, price: entryPrice }
      });
    }
  };

  const exitPosition = () => {
    if (currentIndex > 1 && displayData.close.length > currentIndex - 1) {
      const currentPrice = displayData.close[currentIndex - 1];
      tradingDispatch({
        type: 'EXIT_POSITION',
        payload: { currentPrice }
      });
    }
  };

  // UI functions
  const toggleTheme = () => setIsDarkTheme(prev => !prev);
  const toggleSymbolDisplay = () => {
    setIsSymbolScrambled(prev => !prev);
    if (!isSymbolScrambled) {
      setScrambledSymbol(generateSymbol());
    }
  };

  // Data fetching
  const fetchPatternData = async () => {
    try {
      playbackControls.reset();
      const { symbol, timestamp } = await API.fetchPatternData(patternType);
      setSymbol(symbol);
      await fetchStockData(symbol, timestamp);
    } catch (error) {
      console.error("Error fetching pattern data:", error);
    }
  };

  const fetchStockData = async (symbol, timestamp) => {
    try {
      const data = await API.fetchStockData(symbol, timestamp, dayTrade);
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // Update portfolio value
  useEffect(() => {
    if (currentIndex > 0 && displayData.close) {
      const currentPrice = displayData.close[currentIndex - 1];
      tradingDispatch({
        type: 'UPDATE_PORTFOLIO',
        payload: { currentPrice }
      });
    }
  }, [currentIndex, displayData.close]);

  useEffect(() => {
    setScrambledSymbol(generateSymbol());
  }, []);

  const playbackStyle = {
    width: '90vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const tradingStyle = {
  width: '90vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'green'
}
  return (
    <div style={styles.edge}>
      <h1>Pattern Trading Dashboard</h1>
      <PatternCarousel />
      <a href='https://a.webull.com/NwcK53BxT9BKOwjEn5'> Get started with Webull! </a>
      <p> Donate crypto! 3N73gLrHnLNNGFQNo8yF5xKB1r3mfyjRMF </p>

      <h3 style={styles.headerText}>
        <span style={{ marginLeft: '60px' }}>
          Average Entry Price: ${tradingState.averageEntryPrice.toFixed(2)}
        </span>
        <span style={{ marginLeft: '100px' }}>
          Average Short Price: ${tradingState.averageShortPrice.toFixed(2)}
        </span>
      </h3>

      <h3 style={styles.headerText}>
        <span style={{ marginLeft: '60px' }}>
          Shares Owned: {tradingState.sharesOwned}
        </span>
        <span style={{ marginLeft: '100px' }}>
          Shorted Shares: {tradingState.shortedShares}
        </span>
      </h3>

      <h3>Total Portfolio Value: ${tradingState.totalPortfolio.toFixed(2)}</h3>

      <div className="controls">
        <select onChange={(e) => setPatternType(e.target.value)} value={patternType}>
          <option value="random">Random Data</option>
          <option value="double_bottom">Double Bottom</option>
          <option value="volatility">High Volatility</option>
          <option value="green">Solid Green</option>
          <option value="green_five">Green Five</option>
          <option value="hammer">Hammer</option>
        </select>

        <button onClick={fetchPatternData}>Fetch Pattern Data</button>
        <button onClick={() => setDayTrade(prev => !prev)}>
          Currently {dayTrade ? 'DayTrad' : 'Swingi'}ing. Click to {dayTrade ? 'Swing' : 'DayTrade'}
        </button>

        <button onClick={toggleTheme}>
          Switch to {isDarkTheme ? 'Light' : 'Dark'} Theme
        </button>
        <button onClick={toggleSymbolDisplay}>
          {isSymbolScrambled ? 'Un' : ''}scramble Ticker
        </button>
      </div>

      <h3 style={{ color: tradingState.profitLoss >= 0 ? 'green' : 'red' }}>
        Relative Profit/Loss: ${tradingState.profitLoss.toFixed(2)}
      </h3>

      <div className="playback-controls" style={playbackStyle}>
        <button onClick={playbackControls.start} disabled={isPlaying}>Start</button>
        <button onClick={playbackControls.stop} disabled={!isPlaying}>Pause</button>
        <button onClick={playbackControls.reset}>Reset</button>
        <button onClick={playbackControls.speedUp}>Speed Up</button>
        <button onClick={playbackControls.slowDown}>Slow Down</button>
      </div>

      <div className="trading-controls" style={tradingStyle}>
        <button onClick={() => enterPosition(1)}>Buy</button>
        <button onClick={() => enterPosition(5)}>Enter x5</button>
        <button onClick={exitPosition}>Close</button>
        <button onClick={() => shortPosition(1)}>Short</button>
        <button onClick={() => shortPosition(5)}>Short x5</button>
      </div>

      {displayData.dates.length > 0 && (
        <Plot
          data={[
            {
              x: displayData.dates,
              open: displayData.open,
              high: displayData.high,
              low: displayData.low,
              close: displayData.close,
              type: 'candlestick',
              xaxis: 'x',
              yaxis: 'y',
            },
            {
              type: 'bar',
              x: displayData.dates,
              y: displayData.volume,
              xaxis: 'x2',
              yaxis: 'y2'
            }
          ]}
          layout={isDarkTheme ? darkThemeLayout : lightThemeLayout}
          style={styles.chart}
          config={{
            displayModeBar: false,
            autosizable: true,
            scrollZoom: true,
            responsive: true
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
