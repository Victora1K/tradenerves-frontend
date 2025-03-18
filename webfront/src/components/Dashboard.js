import React, { useState, useEffect } from 'react';
import CandlestickChart from './CandlestickChart';
import PatternCarousel from './PatternCarousel';
import Plot from 'react-plotly.js';
import { useTrading } from '../context/TradingContext';
import { usePlayback } from '../hooks/usePlayback';
import API from '../services/api';
import './Dashboard.css';

const Dashboard = ({ totalAccountValue, setTotalAccountValue }) => {
  // State
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState({ dates: [], open: [], high: [], low: [], close: [], volume: [] });
  const [patternType, setPatternType] = useState('random');
  const [selectedProfitView, setSelectedProfitView] = useState('total');
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

  // Format currency with commas and 2 decimal places
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

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
        payload: { price: currentPrice }
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
    if (displayData.close && displayData.close[currentIndex] !== undefined) {
      const currentPrice = displayData.close[currentIndex];
      tradingDispatch({ 
        type: 'UPDATE_PRICE', 
        payload: { price: currentPrice }
      });
    }
  }, [currentIndex, displayData.close, tradingDispatch]);

  useEffect(() => {
    if (stockData.close && stockData.close.length > 0) {
      const lastPrice = stockData.close[stockData.close.length - 1];
      tradingDispatch({ 
        type: 'UPDATE_PRICE', 
        payload: { price: lastPrice }
      });
    }
  }, [stockData.close, tradingDispatch]);

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

  const handlePatternChange = (newPattern) => {
    setPatternType(newPattern);
    tradingDispatch({ type: 'SET_PATTERN', payload: newPattern });
  };

  const capitalizePattern = (pattern) => {
    return pattern
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCurrentProfit = () => {
    const profit = selectedProfitView === 'total' 
      ? (tradingState.patternProfits?.total || 0)
      : (tradingState.patternProfits?.[selectedProfitView] || 0);
    return isNaN(profit) ? 0 : profit;
  };

  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div style={styles.edge} className='center'>
      <h1>Pattern Trading Dashboard</h1>
      <p> Donate crypto! 3N73gLrHnLNNGFQNo8yF5xKB1r3mfyjRMF </p>
      <a href='https://a.webull.com/NwcK53BxT9BKOwjEn5'> Get started with Webull! </a>

      <div className="portfolio-summary" style={{ marginBottom: '20px' }}>
        <h3 style={styles.headerText}>
          <span style={{ marginLeft: '60px' }}>
            Average Entry Price: {formatCurrency(tradingState.averageEntryPrice)}
            . Shares: {formatNumber(tradingState.sharesOwned)}
          </span>
          <span style={{ marginLeft: '100px' }}>
            Average Short Price: {formatCurrency(tradingState.averageShortPrice)}
            . Shorts: {formatNumber(tradingState.shortedShares)}
          </span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <h3>Buying Power: {formatCurrency(tradingState.accountValue)}</h3>
          <h3>Current Price: {formatCurrency(displayData.close?.[currentIndex - 1] || 0)}</h3>
          <h3 style={{ 
            color: tradingState.totalPortfolio >= tradingState.accountValue ? '#4CAF50' : '#FF5252',
            fontWeight: 'bold'
          }}>
            Total Portfolio Value: {formatCurrency(tradingState.totalPortfolio)}
          </h3>
        </div>
      </div>

      <div className='controls'>
        <select 
          className='custom-select' 
          onChange={(e) => handlePatternChange(e.target.value)} 
          value={patternType}
        >
          <option value="random">Random Data</option>
          <option value="double_bottom">Double Bottom</option>
          <option value="volatility">High Volatility</option>
          <option value="green">Solid Green</option>
          <option value="hammer">Hammer</option>
        </select>

        <select 
          className='custom-select' 
          onChange={(e) => setSelectedProfitView(e.target.value)} 
          value={selectedProfitView}
          style={{ marginLeft: '10px' }}
        >
          <option value="total">Total Profits/Losses</option>
          <option value="random">Random Pattern P/L</option>
          <option value="double_bottom">Double Bottom P/L</option>
          <option value="volatility">High Volatility P/L</option>
          <option value="green">Green P/L</option>
          <option value="hammer">Hammer P/L</option>
        </select>

        <button className="playback-controls" onClick={fetchPatternData}>Fetch Pattern Data</button>
        <button className="playback-controls" onClick={toggleSymbolDisplay}>
          {isSymbolScrambled ? 'Uns' : 'S'}cramble Ticker
        </button>
      </div>

      <h3 style={{ color: getCurrentProfit() >= 0 ? 'green' : 'red' }}>
        {selectedProfitView === 'total' ? 'Total' : capitalizePattern(selectedProfitView)} Profit/Loss: $
        {formatNumber(getCurrentProfit()).toFixed(2)}
      </h3>

      <div className="playback-controls" style={playbackStyle}>
        <button onClick={playbackControls.start} disabled={isPlaying}>{'▶ Play'}</button>
        <button onClick={playbackControls.stop} disabled={!isPlaying}>{'⏸ Pause '}</button>
        <button onClick={playbackControls.reset}>Reset</button>
        <button onClick={playbackControls.speedUp}>{'⏩︎ Speed Up'}</button>
        <button onClick={playbackControls.slowDown}>{'⏪︎ Slow Down'}</button>
      </div>

      <div className="trading-controls" style={tradingStyle}>
        <button onClick={() => enterPosition(1)}>Buy</button>
        <button onClick={() => enterPosition(5)}>Buy 5x</button>
        <button onClick={exitPosition}>Close</button>
        <button onClick={() => shortPosition(1)}>Short</button>
        <button onClick={() => shortPosition(5)}>Short 5x</button>
      </div>

      {displayData.dates.length > 0 && (
        <Plot
          data={[
            {
              type: 'candlestick',
              x: displayData.dates,
              open: displayData.open,
              high: displayData.high,
              low: displayData.low,
              close: displayData.close,
              xaxis: 'x',
              yaxis: 'y',
              increasing: { line: { color: '#4CAF50' } },
              decreasing: { line: { color: '#FF5252' } }
            },
            {
              type: 'bar',
              x: displayData.dates,
              y: displayData.volume,
              xaxis: 'x2',
              yaxis: 'y2',
              marker: {
                color: '#7F7F7F',
                opacity: 0.5
              }
              
            }
          ]}
          layout={{
            dragmode: 'zoom',
            showlegend: false,
            title: {
              text: `${isSymbolScrambled ? scrambledSymbol : symbol} Candlestick Chart`,
              font: { color: '#000000' },
            },
            grid: {
              rows: 2,
              columns: 1,
              pattern: 'independent',
              roworder: 'top to bottom'
            },
            xaxis: {
              title: 'Date',
              rangeslider: { visible: false },
              type: 'date',
              domain: [0, 1],
              rangebreaks: [
                { pattern: 'day of week', bounds: ['sat', 'mon'] }
              ]
            },
            yaxis: {
              title: 'Price',
              domain: [0.2, 1],
              titlefont: { color: '#1f77b4' },
              tickfont: { color: '#1f77b4' }
            },
            xaxis2: {
              title: '',
              rangeslider: { visible: false },
              type: 'date',
              domain: [0, 1],
              rangebreaks: [
                { pattern: 'day of week', bounds: ['sat', 'mon'] }
              ]
            },
            yaxis2: {
              title: 'Volume',
              domain: [0, 0.15],
              titlefont: { color: '#7F7F7F' },
              tickfont: { color: '#7F7F7F' }
            },
            height: 600,
            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
          }}
          config={{
            displayModeBar: false,
            scrollZoom: true,
            responsive: true
          }}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};

export default Dashboard;
