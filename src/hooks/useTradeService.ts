import { useState, useEffect } from 'react';
import { tradeService, Trade, Position } from '../services/tradeService';

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTrades = () => {
      setTrades(tradeService.getTrades());
      setLoading(false);
    };

    updateTrades();
    const unsubscribe = tradeService.subscribe(updateTrades);

    return unsubscribe;
  }, []);

  return { trades, loading };
};

export const useAllTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTrades = () => {
      setTrades(tradeService.getTrades());
      setLoading(false);
    };

    updateTrades();
    const unsubscribe = tradeService.subscribe(updateTrades);

    return unsubscribe;
  }, []);

  return { trades, loading };
};

export const usePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updatePositions = () => {
      setPositions(tradeService.getOpenPositions());
      setLoading(false);
    };

    updatePositions();
    const unsubscribe = tradeService.subscribe(updatePositions);

    return unsubscribe;
  }, []);

  return { positions, loading };
};

export const usePortfolioStats = () => {
  const [stats, setStats] = useState({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    openPositionsCount: 0,
    totalTradesCount: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(tradeService.getPortfolioStats());
    };

    updateStats();
    const unsubscribe = tradeService.subscribe(updateStats);

    return unsubscribe;
  }, []);

  return stats;
};