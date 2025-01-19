import React, { useState, useEffect } from 'react';
import PatternCarousel from './PatternCarousel';
import Plot from 'react-plotly.js';
import { usePracticePlayback } from '../hooks/usePracticePlayback';

const Practice = ({ totalAccountValue, setTotalAccountValue }) => {
  const [stockData, setStockData] = useState({ 
    dates: [], 
    open: [], 
    high: [], 
    low: [], 
    close: [], 
    volume: [] 
  });
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const { 
    displayData, 
    currentIndex,
    isPlaying,
    controls: playbackControls
  } = usePracticePlayback(stockData);

  // Theme and Layout
  const chartLayout = {
    paper_bgcolor: isDarkTheme ? '#333333' : 'white',
    plot_bgcolor: isDarkTheme ? '#333333' : 'white',
    font: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
    xaxis: {
      title: 'Date',
      color: isDarkTheme ? '#FFFFFF' : '#000000',
      domain: [0, 1],
      anchor: 'y',
      tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
      gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
      rangeslider: { visible: false },
    },
    yaxis: {
      title: 'Price',
      color: isDarkTheme ? '#FFFFFF' : '#000000',
      domain: [0.24, 1],
      tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
      gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
    },
    xaxis2: {
      title: '',
      color: isDarkTheme ? '#FFFFFF' : '#000000',
      domain: [0, 1],
      anchor: 'y2',
      tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
      gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
    },
    yaxis2: {
      title: 'Volume',
      color: isDarkTheme ? '#FFFFFF' : '#000000',
      domain: [0, 0.18],
      anchor: 'x2',
      tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
      gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
    },
    grid: {
      pattern: 'Independent',
      rows: 2,
      columns: 1,
    },
    margin: { l: 50, r: 50, t: 50, b: 50 },
  };

  useEffect(() => {
    generateRandomData();
  }, []);

  const generateRandomData = () => {
    const dates = [];
    const open = [];
    const high = [];
    const low = [];
    const close = [];
    const volume = [];
    
    let basePrice = 100;
    const totalCandles = 100; // Generate 100 candles
    const startDate = new Date();
    
    for (let i = 0; i < totalCandles; i++) {
      // Generate date
      const currentDate = new Date(startDate);
      currentDate.setMinutes(startDate.getMinutes() + i * 5);
      dates.push(currentDate);

      // Generate OHLC data
      const volatility = basePrice * 0.02;
      const o = basePrice + (Math.random() - 0.5) * volatility;
      const h = o + Math.random() * volatility;
      const l = o - Math.random() * volatility;
      const c = l + Math.random() * (h - l);

      open.push(o);
      high.push(h);
      low.push(l);
      close.push(c);

      // Generate volume
      volume.push(Math.floor(Math.random() * 10000) + 1000);

      // Update base price for next candle
      basePrice = c;
    }

    setStockData({
      dates: dates,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume
    });
  };

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className="dashboard-container" style={{ marginTop: '60px' }}>
      <div className="controls-container">
        <div>Practice </div>
        <button onClick={generateRandomData}>New Random Data</button>
        <button onClick={handleThemeToggle}>
          Toggle {isDarkTheme ? 'Light' : 'Dark'} Theme
        </button>
        <div className="playback-controls">
          <button 
            onClick={playbackControls.togglePlay}
            style={{ 
              backgroundColor: isPlaying ? '#ff4444' : '#44ff44',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              marginRight: '8px'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button 
            onClick={playbackControls.reset}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              marginRight: '8px'
            }}
          >
            ⟲ Reset
          </button>
        </div>
      </div>

      <div className="chart-container">
        <Plot
          data={[
            {
              type: 'candlestick',
              x: displayData.dates,
              open: displayData.open,
              high: displayData.high,
              low: displayData.low,
              close: displayData.close,
              yaxis: 'y',
              name: 'OHLC'
            },
            {
              type: 'bar',
              x: displayData.dates,
              y: displayData.volume,
              yaxis: 'y2',
              xaxis: 'x2',
              name: 'Volume',
              marker: {
                color: displayData.close.map((close, i) => 
                  (i > 0 ? close >= displayData.close[i - 1] : true) ? '#26A69A' : '#EF5350'
                )
              }
            }
          ]}
          layout={chartLayout}
          style={{ width: '100%', height: '600px' }}
          config={{ responsive: true }}
        />
      </div>

      <PatternCarousel />
    </div>
  );
};

export default Practice;
