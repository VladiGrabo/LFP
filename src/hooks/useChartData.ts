import { useState, useEffect } from 'react';
import { reliableMarketDataService, ChartData } from '../services/reliableMarketData';

export const useChartData = (symbol: string) => {
  const [data, setData] = useState<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const chartData = await reliableMarketDataService.getChartData(symbol, '15m');

        console.log('Loaded chart data:', chartData.length, 'candles');

        const formattedData = chartData.map((item: ChartData) => ({
          time: Math.floor(item.timestamp / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        console.log('Formatted data sample:', formattedData[0]);
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [symbol]);

  return { data, isLoading };
};
