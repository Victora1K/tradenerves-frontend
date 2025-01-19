import React, { createContext, useReducer, useContext } from 'react';

const TradingContext = createContext();

const initialState = {
  sharesOwned: 0,
  shortedShares: 0,
  accountValue: 10000,
  profitLoss: 0,
  entryPrices: [],
  shortedPrices: [],
  averageEntryPrice: 0,
  averageShortPrice: 0,
  totalPortfolio: 10000
};

function calculateAveragePrice(prices) {
  if (prices.length === 0) return 0;
  return prices.reduce((acc, price) => acc + price, 0) / prices.length;
}

function tradingReducer(state, action) {
  switch (action.type) {
    case 'ENTER_POSITION': {
      const { price, shares = 1 } = action.payload;
      if (state.accountValue >= price * shares) {
        return {
          ...state,
          sharesOwned: state.sharesOwned + shares,
          accountValue: state.accountValue - (price * shares),
          entryPrices: [...state.entryPrices, ...Array(shares).fill(price)],
          averageEntryPrice: calculateAveragePrice([...state.entryPrices, ...Array(shares).fill(price)])
        };
      }
      return state;
    }

    case 'SHORT_POSITION': {
      const { price, shares = 1 } = action.payload;
      const marginRequired = price * 5;
      if (state.accountValue >= marginRequired * shares) {
        return {
          ...state,
          shortedShares: state.shortedShares + shares,
          accountValue: state.accountValue + (price * shares),
          shortedPrices: [...state.shortedPrices, ...Array(shares).fill(price)],
          averageShortPrice: calculateAveragePrice([...state.shortedPrices, ...Array(shares).fill(price)])
        };
      }
      return state;
    }

    case 'EXIT_POSITION': {
      const { currentPrice } = action.payload;
      let newState = { ...state };

      if (state.sharesOwned > 0) {
        const profit = (currentPrice - state.averageEntryPrice) * state.sharesOwned;
        newState = {
          ...newState,
          accountValue: state.accountValue + (state.sharesOwned * currentPrice),
          profitLoss: state.profitLoss + profit,
          sharesOwned: 0,
          entryPrices: [],
          averageEntryPrice: 0
        };
      }

      if (state.shortedShares > 0) {
        const totalShortedProfit = state.shortedPrices.reduce((acc, shortPrice) => 
          acc + (shortPrice - currentPrice), 0);
        newState = {
          ...newState,
          accountValue: newState.accountValue - (state.shortedShares * currentPrice),
          profitLoss: newState.profitLoss + totalShortedProfit,
          shortedShares: 0,
          shortedPrices: [],
          averageShortPrice: 0
        };
      }

      return newState;
    }

    case 'UPDATE_PORTFOLIO': {
      const { currentPrice } = action.payload;
      const totalPortfolio = state.accountValue + 
        (state.sharesOwned * currentPrice) - 
        (state.shortedShares * currentPrice);
      
      return {
        ...state,
        totalPortfolio
      };
    }

    default:
      return state;
  }
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
