import { useState, useEffect, useRef } from 'react';

export function usePlayback(stockData, initialSpeed = 200) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [playSpeed, setPlaySpeed] = useState(initialSpeed);
  const [maxRange, setMaxRange] = useState(1750)
  const [displayData, setDisplayData] = useState({ 
    dates: [], open: [], high: [], low: [], close: [], volume: [] 
  });
  
  const dataRef = useRef(stockData);

  useEffect(() => {
    dataRef.current = stockData;
    if (stockData.dates.length > 0) {
      setDisplayData({
        dates: stockData.dates.slice(0, 250),
        open: stockData.open.slice(0, 250),
        high: stockData.high.slice(0, 250),
        low: stockData.low.slice(0, 250),
        close: stockData.close.slice(0, 250),
        volume: stockData.volume.slice(0, 250),
      });
      setCurrentIndex(250);
      
    }
    return () => stopPlayback();
  }, [stockData]);

  useEffect(() => {
    if (intervalId) {
      stopPlayback();
      startPlayback();
    }
  }, [playSpeed]);

  const startPlayback = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    const id = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (dataRef.current.dates.length < maxRange) {
          setMaxRange(1200)
      
        }
        if (nextIndex < maxRange) {
          setDisplayData({
            dates: dataRef.current.dates.slice(0, nextIndex),
            open: dataRef.current.open.slice(0, nextIndex),
            high: dataRef.current.high.slice(0, nextIndex),
            low: dataRef.current.low.slice(0, nextIndex),
            close: dataRef.current.close.slice(0, nextIndex),
            volume: dataRef.current.volume.slice(0, nextIndex),
          });
          return nextIndex;
        } else {
          clearInterval(id);
          return prevIndex;
        }
      });
    }, playSpeed);
    
    setIntervalId(id);
  };

  const stopPlayback = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetPlayback = () => {
    stopPlayback();
    setCurrentIndex(0);
    setDisplayData({ 
      dates: dataRef.current.dates.slice(0,250),
      open: dataRef.current.open.slice(0,250),
      high: dataRef.current.high.slice(0,250),
      low: dataRef.current.low.slice(0,250),
      close: dataRef.current.close.slice(0,250),
      volume: dataRef.current.volume.slice(0,250),
    });
  };

  const adjustSpeed = (faster) => {
    setPlaySpeed(prev => {
      const newSpeed = faster ? prev / 2 : prev * 2;
      return Math.max(Math.min(newSpeed, 2000), 50);
    });
  };

  // Provide both old and new control interfaces for backward compatibility
  const controls = {
    start: startPlayback,
    stop: stopPlayback,
    reset: resetPlayback,
    speedUp: () => adjustSpeed(true),
    slowDown: () => adjustSpeed(false),
    // New interface
    togglePlay: () => intervalId ? stopPlayback() : startPlayback(),
    setPlaySpeed: (speed) => setPlaySpeed(speed)
  };

  return {
    currentIndex,
    displayData,
    playSpeed,
    isPlaying: !!intervalId,
    controls
  };
}
