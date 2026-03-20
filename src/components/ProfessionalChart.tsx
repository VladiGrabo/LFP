import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useChartData } from '../hooks/useChartData';

interface ProfessionalChartProps {
  symbol: string;
}

const ProfessionalChart: React.FC<ProfessionalChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const { data, isLoading } = useChartData(symbol);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('15m');
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('Creating chart...');

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    console.log('Chart created, series ready:', !!candlestickSeries);
    setChartReady(true);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      setChartReady(false);
    };
  }, []);

  useEffect(() => {
    if (!chartReady) {
      console.log('Chart not ready yet');
      return;
    }

    if (!candlestickSeriesRef.current) {
      console.log('Series not available');
      return;
    }

    if (!data || data.length === 0) {
      console.log('No data available yet');
      return;
    }

    console.log('Updating chart with data:', data.length, 'candles');
    console.log('First candle:', data[0]);
    console.log('Last candle:', data[data.length - 1]);

    try {
      candlestickSeriesRef.current.setData(data);

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
      console.log('Chart updated successfully');
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }, [data, chartReady]);

  const timeframes = [
    { value: '1m' as const, label: '1m' },
    { value: '5m' as const, label: '5m' },
    { value: '15m' as const, label: '15m' },
    { value: '1h' as const, label: '1H' },
    { value: '4h' as const, label: '4H' },
    { value: '1d' as const, label: '1D' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg md:text-xl font-bold text-white">
            {symbol.replace('USDT', '/USDT')}
          </h3>
          {data && data.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                ${data[data.length - 1].close.toFixed(2)}
              </span>
              {(() => {
                const change = ((data[data.length - 1].close - data[0].open) / data[0].open) * 100;
                return (
                  <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                timeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div ref={chartContainerRef} className="relative" />
      )}
    </div>
  );
};

export default ProfessionalChart;
