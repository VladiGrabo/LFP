import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import { Line, Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff, BarChart3, Activity, Maximize2, ZoomIn, ZoomOut, RotateCcw, Candy as CandleIcon } from 'lucide-react';
import { reliableMarketDataService, ChartData, ReliableMarketData } from '../services/reliableMarketData';

// Импортируем финансовые контроллеры
let CandlestickController: any;
let CandlestickElement: any;
let OhlcController: any;
let OhlcElement: any;

// Динамическая загрузка финансовых компонентов
const loadFinancialComponents = async () => {
  try {
    const financial = await import('chartjs-chart-financial');
    CandlestickController = financial.CandlestickController;
    CandlestickElement = financial.CandlestickElement;
    OhlcController = financial.OhlcController;
    OhlcElement = financial.OhlcElement;
    
    // Регистрируем финансовые компоненты
    ChartJS.register(
      CandlestickController,
      CandlestickElement,
      OhlcController,
      OhlcElement
    );
    
    console.log('[ChartJS] Financial components loaded and registered');
    return true;
  } catch (error) {
    console.error('[ChartJS] Failed to load financial components:', error);
    return false;
  }
};

// Регистрируем базовые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  zoomPlugin
);

interface ChartJSChartProps {
  selectedAsset: string;
}

const ChartJSChart: React.FC<ChartJSChartProps> = ({ selectedAsset }) => {
  const chartRef = useRef<any>(null);
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [marketData, setMarketData] = useState<ReliableMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'area' | 'ohlc'>('candlestick');
  const [timeframe, setTimeframe] = useState('1D');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [financialComponentsLoaded, setFinancialComponentsLoaded] = useState(false);

  const timeframes = [
    { key: '1m', label: '1м', name: '1 минута' },
    { key: '5m', label: '5м', name: '5 минут' },
    { key: '15m', label: '15м', name: '15 минут' },
    { key: '1h', label: '1ч', name: '1 час' },
    { key: '4h', label: '4ч', name: '4 часа' },
    { key: '1D', label: '1Д', name: '1 день' },
    { key: '1W', label: '1Н', name: '1 неделя' },
    { key: '1M', label: '1М', name: '1 месяц' },
  ];

  // Загрузка финансовых компонентов при инициализации
  useEffect(() => {
    const initFinancialComponents = async () => {
      const loaded = await loadFinancialComponents();
      setFinancialComponentsLoaded(loaded);
      if (!loaded) {
        console.warn('[ChartJS] Financial components not available, falling back to line charts');
      }
    };

    initFinancialComponents();
  }, []);

  // Мониторинг сетевого соединения
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Загрузка данных графика
  useEffect(() => {
    const loadChartData = async () => {
      if (!isOnline) {
        setError('Нет интернет-соединения');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`[ChartJS] Loading data for ${selectedAsset} (${timeframe})`);
        const data = await reliableMarketDataService.getChartData(selectedAsset, timeframe);
        setChartData(data);
        
        if (data.length > 0) {
          setCurrentPrice(data[data.length - 1].close);
        }
        
        setLastUpdate(new Date());
        setLoading(false);
        console.log(`[ChartJS] Loaded ${data.length} data points`);
      } catch (error) {
        console.error('[ChartJS] Error loading chart data:', error);
        setError('Не удалось загрузить данные графика');
        setLoading(false);
      }
    };

    loadChartData();
  }, [selectedAsset, timeframe, isOnline]);

  // Подписка на обновления рыночных данных
  useEffect(() => {
    const unsubscribe = reliableMarketDataService.subscribe(selectedAsset, (data) => {
      setMarketData(data);
      if (currentPrice === null) {
        setCurrentPrice(data.price);
      }
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [selectedAsset, currentPrice]);

  // Симуляция движущихся данных
  useEffect(() => {
    if (!marketData || currentPrice === null) return;

    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.002;
      const newPrice = currentPrice * (1 + variation);
      const change = newPrice - currentPrice;
      
      setCurrentPrice(newPrice);
      setPriceChange(change);
      setIsAnimating(true);
      
      // Обновляем последнюю точку данных
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];
        newData[newData.length - 1] = {
          ...lastPoint,
          close: newPrice,
          high: Math.max(lastPoint.high, newPrice),
          low: Math.min(lastPoint.low, newPrice)
        };
        
        return newData;
      });

      setTimeout(() => setIsAnimating(false), 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [marketData, currentPrice]);

  // Подготовка данных для Chart.js
  const prepareChartData = () => {
    if (chartData.length === 0) return null;

    const labels = chartData.map(item => new Date(item.timestamp));
    
    if (chartType === 'line') {
      return {
        labels,
        datasets: [
          {
            label: `${selectedAsset} Цена`,
            data: chartData.map(item => item.close),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      };
    } else if (chartType === 'area') {
      return {
        labels,
        datasets: [
          {
            label: `${selectedAsset} Цена`,
            data: chartData.map(item => item.close),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      };
    } else if (chartType === 'candlestick' && financialComponentsLoaded) {
      // Настоящие японские свечи
      return {
        datasets: [
          {
            label: `${selectedAsset} Свечи`,
            data: chartData.map(item => ({
              x: item.timestamp,
              o: item.open,
              h: item.high,
              l: item.low,
              c: item.close,
            })),
            color: {
              up: '#10b981',
              down: '#ef4444',
              unchanged: '#6b7280',
            },
            borderColor: {
              up: '#10b981',
              down: '#ef4444',
              unchanged: '#6b7280',
            },
            borderWidth: 1,
          },
        ],
      };
    } else if (chartType === 'ohlc' && financialComponentsLoaded) {
      // OHLC бары
      return {
        datasets: [
          {
            label: `${selectedAsset} OHLC`,
            data: chartData.map(item => ({
              x: item.timestamp,
              o: item.open,
              h: item.high,
              l: item.low,
              c: item.close,
            })),
            color: {
              up: '#10b981',
              down: '#ef4444',
              unchanged: '#6b7280',
            },
            borderWidth: 2,
          },
        ],
      };
    } else {
      // Фоллбэк на линейный график если финансовые компоненты не загружены
      return {
        labels,
        datasets: [
          {
            label: `${selectedAsset} Цена`,
            data: chartData.map(item => item.close),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 1,
            pointHoverRadius: 4,
          },
        ],
      };
    }
  };

  // Опции для Chart.js
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          display: true,
        },
        title: {
          display: true,
          text: `${selectedAsset} - ${timeframes.find(tf => tf.key === timeframe)?.name}`,
          font: {
            size: 16,
            weight: 'bold' as const,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#2563eb',
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              if ((chartType === 'candlestick' || chartType === 'ohlc') && financialComponentsLoaded) {
                const point = context.parsed;
                return [
                  `Открытие: $${point.o?.toFixed(2) || 'N/A'}`,
                  `Максимум: $${point.h?.toFixed(2) || 'N/A'}`,
                  `Минимум: $${point.l?.toFixed(2) || 'N/A'}`,
                  `Закрытие: $${point.c?.toFixed(2) || 'N/A'}`,
                ];
              } else {
                const value = context.parsed.y;
                return `${context.dataset.label}: $${value.toFixed(2)}`;
              }
            },
          },
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x' as const,
          },
          pan: {
            enabled: true,
            mode: 'x' as const,
            modifierKey: 'ctrl' as const,
          },
          limits: {
            x: { min: 'original' as const, max: 'original' as const },
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MMM dd',
              week: 'MMM dd',
              month: 'MMM yyyy',
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            callback: function(value: any) {
              return '$' + value.toFixed(2);
            },
          },
        },
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 4,
        },
      },
      animation: {
        duration: isAnimating ? 300 : 0,
      },
    };

    return baseOptions;
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await reliableMarketDataService.getChartData(selectedAsset, timeframe);
      setChartData(data);
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      setError('Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && chartRef.current?.parentElement) {
      chartRef.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom(1.1);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom(0.9);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Обработчик выхода из полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedAsset} - График
            </h3>
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <WifiOff className="w-4 h-4" />
              <span>Офлайн</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="text-center">
            <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">Нет интернет-соединения</p>
            <p className="text-gray-500 text-sm">Проверьте подключение к интернету</p>
          </div>
        </div>
      </div>
    );
  }

  const data = prepareChartData();
  const options = getChartOptions();

  // Определяем тип графика для Chart компонента
  const getChartComponentType = () => {
    if (chartType === 'candlestick' && financialComponentsLoaded) {
      return 'candlestick';
    } else if (chartType === 'ohlc' && financialComponentsLoaded) {
      return 'ohlc';
    } else {
      return 'line';
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Заголовок */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-900">
                {selectedAsset} - График
              </h3>
              {/* Живая цена */}
              {currentPrice !== null && (
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold transition-all duration-300 ${
                    isAnimating ? 'scale-110' : 'scale-100'
                  } ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${currentPrice.toFixed(2)}
                  </span>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-300 ${
                    priceChange >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  } ${isAnimating ? 'animate-pulse' : ''}`}>
                    {priceChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-medium">
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
                    </span>
                    <span className="text-xs">
                      ({priceChange >= 0 ? '+' : ''}{((priceChange / (currentPrice - priceChange)) * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Источник данных */}
              {marketData && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {marketData.source}
                </div>
              )}
              
              {/* Статус соединения */}
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Wifi className="w-3 h-3 text-green-500" />
                <div className={`w-2 h-2 rounded-full ${
                  loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                }`}></div>
              </div>

              {/* Управление масштабом */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Увеличить"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Уменьшить"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Сбросить масштаб"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Полноэкранный режим */}
              <button
                onClick={toggleFullscreen}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Полноэкранный режим"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              {/* Кнопка обновления */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Элементы управления */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Тип графика */}
            <div className="flex space-x-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1 ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Линия</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1 ${
                  chartType === 'area'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Область</span>
              </button>
              <button
                onClick={() => setChartType('candlestick')}
                disabled={!financialComponentsLoaded}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 ${
                  chartType === 'candlestick'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={!financialComponentsLoaded ? 'Финансовые компоненты не загружены' : 'Японские свечи'}
              >
                <CandleIcon className="w-3 h-3" />
                <span>Свечи</span>
              </button>
              <button
                onClick={() => setChartType('ohlc')}
                disabled={!financialComponentsLoaded}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 ${
                  chartType === 'ohlc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={!financialComponentsLoaded ? 'Финансовые компоненты не загружены' : 'OHLC бары'}
              >
                <BarChart3 className="w-3 h-3" />
                <span>OHLC</span>
              </button>
            </div>

            {/* Таймфрейм */}
            <div className="flex space-x-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  title={tf.name}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    timeframe === tf.key
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* График */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Загрузка данных графика...</p>
              <p className="text-gray-500 text-sm">
                {timeframes.find(tf => tf.key === timeframe)?.name} • {selectedAsset}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-600 font-medium mb-2">Ошибка загрузки графика</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div 
            ref={chartRef}
            style={{ height: isFullscreen ? `${window.innerHeight - 200}px` : '500px' }}
            className="w-full p-4"
          >
            <Chart 
              type={getChartComponentType() as any}
              data={data} 
              options={options} 
            />
          </div>
        )}

        {!loading && !error && !data && (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">Нет данных для отображения</p>
              <p className="text-gray-500 text-sm">Попробуйте выбрать другой актив или таймфрейм</p>
            </div>
          </div>
        )}
      </div>

      {/* Дополнительная информация */}
      {marketData && !isFullscreen && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Объем 24ч:</span>
              <div className="font-medium">${(marketData.volume / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <span className="text-gray-600">Максимум 24ч:</span>
              <div className="font-medium text-green-600">${marketData.high24h.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Минимум 24ч:</span>
              <div className="font-medium text-red-600">${marketData.low24h.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Изменение:</span>
              <div className={`font-medium ${marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marketData.change >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Обновлено:</span>
              <div className="font-medium">{lastUpdate?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartJSChart;