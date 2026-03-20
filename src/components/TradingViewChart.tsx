import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  selectedAsset?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  selectedAsset,
  interval = 'D',
  theme = 'light',
  height = 500
}) => {
  const assetSymbol = symbol || selectedAsset || 'BTCUSDT';
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Очищаем контейнер
    container.current.innerHTML = '';

    // Конвертируем символы в формат TradingView
    const tvSymbol = convertToTradingViewSymbol(assetSymbol);

    // Создаем скрипт для TradingView виджета
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'ru',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current?.id || 'tradingview_chart',
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: true,
          studies: [
            'Volume@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [assetSymbol, interval, theme]);

  return (
    <div
      ref={container}
      id={`tradingview_${assetSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
      style={{ height: `${height}px`, width: '100%' }}
      className="tradingview-widget-container"
    />
  );
};

// Конвертирует наши символы в формат TradingView
function convertToTradingViewSymbol(symbol: string): string {
  const mappings: { [key: string]: string } = {
    // Криптовалюты
    'BTCUSDT': 'BINANCE:BTCUSDT',
    'ETHUSDT': 'BINANCE:ETHUSDT',
    'BNBUSDT': 'BINANCE:BNBUSDT',
    'ADAUSDT': 'BINANCE:ADAUSDT',
    'SOLUSDT': 'BINANCE:SOLUSDT',
    'XRPUSDT': 'BINANCE:XRPUSDT',
    'DOTUSDT': 'BINANCE:DOTUSDT',
    'LINKUSDT': 'BINANCE:LINKUSDT',

    // Акции
    'AAPL': 'NASDAQ:AAPL',
    'MSFT': 'NASDAQ:MSFT',
    'TSLA': 'NASDAQ:TSLA',
    'GOOGL': 'NASDAQ:GOOGL',
    'NVDA': 'NASDAQ:NVDA',
    'AMZN': 'NASDAQ:AMZN',
    'META': 'NASDAQ:META',

    // Форекс
    'EUR/USD': 'FX:EURUSD',
    'GBP/USD': 'FX:GBPUSD',
    'USD/JPY': 'FX:USDJPY',
    'USD/CHF': 'FX:USDCHF',
    'AUD/USD': 'FX:AUDUSD',

    // Сырьевые товары
    'Gold': 'OANDA:XAUUSD',
    'Silver': 'OANDA:XAGUSD',
    'Oil': 'TVC:USOIL',
    'Natural Gas': 'NYMEX:NG1!',
    'Copper': 'COMEX:HG1!'
  };

  return mappings[symbol] || `BINANCE:${symbol}`;
}

// Конвертирует наш таймфрейм в формат TradingView
export function convertToTradingViewInterval(interval: string): string {
  const mappings: { [key: string]: string } = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1D': 'D',
    '1W': 'W',
    '1M': 'M'
  };

  return mappings[interval] || 'D';
}

export default memo(TradingViewChart);
