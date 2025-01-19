// File: PatternsInfo.js

import React from 'react';
import hammer from '../image-patterns/hammer.png';
import hangingman from '../image-patterns/hanging-man.png';
import threeblackcrows from '../image-patterns/three-black-crows.png';
import Navbar from './Navbar';
import totalPortfolio from './Dashboard'


const patternsInfoData = [
    {
      name: 'Hammer',
      description: 'The hammer candlestick pattern is a bullish reversal pattern...',
      imgSrc: hammer,
    },
    {
      name: 'Three Black Crows',
      description: 'The three black crows is a bearish reversal pattern...',
      imgSrc: threeblackcrows,
    },
    {
      name: 'Hanging Man',
      description: 'The hanging man is a bearish reversal pattern typically seen...',
      imgSrc: hangingman,
    },
  ];

  const PatternsInfo = () => {
    return (
        <div style={pageContainerStyle}>
        
            
            <h1> CandleStick Patterns Information </h1>
            {patternsInfoData.map((pattern, index) => (
                <div key={index} style={patternContainerStyle}>
                    <img src={pattern.imgSrc} alt={pattern.name} style={imageStyle} />
                    <h2>{pattern.name}</h2>
                    <p>{pattern.description}</p> 


                </div>
            ))}
            <button> ...more coming soon </button>
                  <a href='https://a.webull.com/NwcK53BxT9BKOwjEn5'> Get started with Webull! </a>
                  
        </div>
    );
  };

  const pageContainerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };
  
  const patternContainerStyle = {
    marginBottom: '30px',
    textAlign: 'center',
  };
  
  const imageStyle = {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
  };

  export default PatternsInfo;