import { useState, useEffect, useRef } from 'react';

export function usePlayback(stockData, initialSpeed = 1000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [playSpeed, setPlaySpeed] = useState(initialSpeed);
  const [displayData, setDisplayData] = useState({ 
    dates: [], open: [], high: [], low: [], close: [], volume: [] 
  });
  
  const dataRef = useRef(stockData);

  useEffect(() => {
    dataRef.current = stockData;
    if (stockData.dates.length > 0) {
      setDisplayData({
        dates: stockData.dates.slice(0, 50),
        open: stockData.open.slice(0, 50),
        high: stockData.high.slice(0, 50),
        low: stockData.low.slice(0, 50),
        close: stockData.close.slice(0, 50),
        volume: stockData.volume.slice(0, 50),
      });
      setCurrentIndex(50);
      
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
        if (nextIndex < dataRef.current.dates.length) {
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
      dates: dataRef.current.dates.slice(0,50),
      open: dataRef.current.open.slice(0,50),
      high: dataRef.current.high.slice(0,50),
      low: dataRef.current.low.slice(0,50),
      close: dataRef.current.close.slice(0,50),
      volume: dataRef.current.volume.slice(0,50),
    });
  };

  const adjustSpeed = (faster) => {
    setPlaySpeed(prev => {
      const newSpeed = faster ? prev / 2 : prev * 2;
      return Math.max(Math.min(newSpeed, 2000), 125);
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
