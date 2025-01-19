import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Plot from 'react-plotly.js';
import { usePlayback } from '../hooks/usePlayback';
import API from '../services/api';
import { useTrading } from '../context/TradingContext';

const Events = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [symbol, setSymbol] = useState('');
    const [stockData, setStockData] = useState({ dates: [], open: [], high: [], low: [], close: [], volume: [] });
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [error, setError] = useState('');

    const popularStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corp.' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.' },
        { symbol: 'META', name: 'Meta Platforms Inc.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' },
        { symbol: 'JPM', name: 'JPMorgan Chase' },
        { symbol: 'V', name: 'Visa Inc.' },
        { symbol: 'WMT', name: 'Walmart Inc.' },
    ];

    const { 
        displayData, 
        currentIndex,
        isPlaying,
        playSpeed,
        controls: playbackControls 
    } = usePlayback(stockData);

    const { state: tradingState, dispatch: tradingDispatch } = useTrading();

    // Theme configurations
    const chartLayout = {
        title: {
            text: `${symbol} Historical Data`,
            font: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
        },
        xaxis: {
            title: 'Date',
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            domain: [0,1],
            anchor: 'y',
            tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
            gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
            rangeslider: { visible: false },
        },
        yaxis: {
            title: 'Price',
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            domain: [0.24,1],
            tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
            gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
        },
        xaxis2: {
            title: 'Date',
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            domain: [0,1],
            anchor: 'y2',
            tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
            gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
        },
        yaxis2: {
            title: 'Volume',
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            domain: [0,0.18],
            anchor: 'x2',
            tickfont: { color: isDarkTheme ? '#FFFFFF' : '#000000' },
            gridcolor: isDarkTheme ? '#444444' : '#e0e0e0',
        },
        grid: {
            pattern: 'Independent',
            rows: 2,
            columns: 1,
        },
        paper_bgcolor: isDarkTheme ? '#1e1e1e' : '#ffffff',
        plot_bgcolor: isDarkTheme ? '#222222' : '#ffffff',
        margin: { l: 50, r: 50, t: 50, b: 50 },
    };

    const fetchHistoricalData = async () => {
        if (!symbol) {
            setError('Please enter a stock symbol');
            return;
        }

        try {
            setError('');
            const data = await API.fetchHistoricalData(symbol, startDate, endDate);
            setStockData(data);
            playbackControls.reset();
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        }
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        header: {
            marginBottom: '20px',
        },
        inputGroup: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            alignItems: 'center',
        },
        input: {
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
        },
        button: {
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
        },
        error: {
            color: 'red',
            marginBottom: '10px',
        },
        chart: {
            width: '100%',
            height: '600px',
        },
    };

      // Theme and Layout
  const darkThemeLayout = {
    title: {
      text: `${symbol} Candlestick Chart`,
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
    const handleSymbolSelect = (selectedSymbol) => {
        setSymbol(selectedSymbol);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Playback a Period </h1>
            </div>

            <div style={styles.inputGroup}>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol"
                    style={styles.input}
                />
                
                <select
                    onChange={(e) => handleSymbolSelect(e.target.value)}
                    style={styles.input}
                    value=""
                >
                    <option value="" disabled>Select popular stock</option>
                    {popularStocks.map(stock => (
                        <option key={stock.symbol} value={stock.symbol}>
                            {stock.symbol} - {stock.name}
                        </option>
                    ))}
                </select>

                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                />

                <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="End Date"
                />

                <button 
                    onClick={fetchHistoricalData}
                    style={styles.button}
                >
                    Fetch Data
                </button>

                <button
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
                    style={styles.button}
                >
                    Toggle Theme
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div className="playback-controls" style={styles.inputGroup}>
                <button onClick={playbackControls.start} disabled={isPlaying}>
                    Start
                </button>
                <button onClick={playbackControls.stop} disabled={!isPlaying}>
                    Pause
                </button>
                <button onClick={playbackControls.reset}>Reset</button>
                <button onClick={playbackControls.speedUp}>Speed Up</button>
                <button onClick={playbackControls.slowDown}>Slow Down</button>
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
                    layout={darkThemeLayout}
                    style={styles.chart}
                    config={{
                        displayModeBar: false,
                        responsive: true
                    }}
                />
            )}
        </div>
    );
};

export default Events;
