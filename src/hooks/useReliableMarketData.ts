import { useState, useEffect } from 'react';
import { reliableMarketDataService, ReliableMarketData } from '../services/reliableMarketData';

export const useReliableMarketData = (symbol: string) => {
  const [data, setData] = useState<ReliableMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const unsubscribe = reliableMarketDataService.subscribe(symbol, (marketData) => {
      setData(marketData);
      setLoading(false);
      setError(null);
    });

    // Если данных нет в кэше, показываем ошибку через некоторое время
    const timeout = setTimeout(() => {
      if (loading) {
        setError(`Не удалось загрузить данные для ${symbol}`);
        setLoading(false);
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [symbol]);

  return { data, loading, error };
};

export const useAllReliableMarketData = () => {
  const [data, setData] = useState<ReliableMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
    const unsubscribers: (() => void)[] = [];
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= symbols.length) {
        setData(reliableMarketDataService.getAllMarketData());
        setLoading(false);
      }
    };

    symbols.forEach(symbol => {
      const unsubscribe = reliableMarketDataService.subscribe(symbol, () => {
        checkAllLoaded();
        setData(reliableMarketDataService.getAllMarketData());
      });
      unsubscribers.push(unsubscribe);
    });

    // Таймаут для загрузки
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Не удалось загрузить рыночные данные');
        setLoading(false);
      }
    }, 15000);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearTimeout(timeout);
    };
  }, []);

  return { data, loading, error };
};