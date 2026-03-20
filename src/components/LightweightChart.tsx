import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface LightweightChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
  height?: number;
}

const LightweightChart: React.FC<LightweightChartProps> = ({
  symbol,
  theme = 'light',
  height = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Инициализация...');

  useEffect(() => {
    if (!chartContainerRef.current) {
      setStatus('Контейнер не найден');
      return;
    }

    const container = chartContainerRef.current;

    try {
      setStatus('Очистка предыдущего графика...');
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      setStatus('Проверка размеров контейнера...');
      const containerWidth = container.clientWidth;
      if (containerWidth === 0) {
        setError('Ширина контейнера равна 0');
        setStatus('Ошибка: нулевая ширина');
        return;
      }

      setStatus('Создание графика...');
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: theme === 'dark' ? '#1e1e1e' : '#ffffff' },
          textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
        },
        width: containerWidth,
        height: height,
        grid: {
          vertLines: { color: theme === 'dark' ? '#2B2B43' : '#e1e3eb' },
          horzLines: { color: theme === 'dark' ? '#2B2B43' : '#e1e3eb' },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: theme === 'dark' ? '#2B2B43' : '#e1e3eb',
        },
        timeScale: {
          borderColor: theme === 'dark' ? '#2B2B43' : '#e1e3eb',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;
      setStatus('График создан');

      setStatus('Создание серии свечей...');
      const candlestickSeries = chart.addSeries('Candlestick' as any, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      setStatus('Генерация данных...');
      const basePrice = getBasePrice(symbol);
      let currentPrice = basePrice;
      const now = Math.floor(Date.now() / 1000);
      const dayInSeconds = 86400;
      const data = [];

      for (let i = 100; i >= 0; i--) {
        const timestamp = now - (i * dayInSeconds);
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility;

        const open = currentPrice;
        const close = currentPrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

        data.push({
          time: timestamp,
          open,
          high,
          low,
          close
        });

        currentPrice = close;
      }

      setStatus('Применение данных...');
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
      setStatus('График готов');
      setError(null);

      const handleResize = () => {
        if (chartRef.current && container) {
          const newWidth = container.clientWidth;
          if (newWidth > 0) {
            chartRef.current.applyOptions({ width: newWidth });
          }
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setStatus(`Ошибка: ${errorMessage}`);
      console.error('Error creating chart:', err);
    }
  }, [symbol, theme, height]);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <div
        ref={chartContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: `${height}px`,
          minHeight: `${height}px`
        }}
      />
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      {!error && status !== 'График готов' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          background: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '8px',
          color: '#666',
          textAlign: 'center'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

function getBasePrice(symbol: string): number {
  const cleanSymbol = symbol.replace('USDT', '').replace('BUSD', '');

  const prices: { [key: string]: number } = {
    'BTC': 43250,
    'BTCUSDT': 43250,
    'ETH': 2650,
    'ETHUSDT': 2650,
    'BNB': 315,
    'BNBUSDT': 315,
    'ADA': 0.485,
    'ADAUSDT': 0.485,
    'SOL': 98,
    'SOLUSDT': 98,
    'XRP': 0.52,
    'XRPUSDT': 0.52,
    'DOT': 6.5,
    'DOTUSDT': 6.5,
    'LINK': 15.5,
    'LINKUSDT': 15.5
  };

  return prices[symbol] || prices[cleanSymbol] || 100;
}

export default LightweightChart;
