import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  interval?: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  theme = 'light',
  interval = '15',
  height = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const containerIdRef = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    const loadTradingViewScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load TradingView script'));
        document.head.appendChild(script);
      });
    };

    const initWidget = async () => {
      if (!containerRef.current) return;

      try {
        await loadTradingViewScript();

        if (widgetRef.current) {
          widgetRef.current.remove();
        }

        const tradingViewSymbol = `BINANCE:${symbol.toUpperCase()}USDT`;

        // Небольшая задержка чтобы DOM был готов
        await new Promise(resolve => setTimeout(resolve, 100));

        const container = document.getElementById(containerIdRef.current);
        if (!container) {
          console.error('Container not found:', containerIdRef.current);
          return;
        }

        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: tradingViewSymbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'ru',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerIdRef.current,
          studies: [],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650'
        });

        console.log('TradingView widget initialized:', tradingViewSymbol);
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
      }
    };

    initWidget();

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.error('Error removing widget:', e);
        }
      }
    };
  }, [symbol, theme, interval]);

  return (
    <div className="tradingview-widget-container bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: `${height}px` }}>
      <div
        id={containerIdRef.current}
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default memo(TradingViewWidget);
