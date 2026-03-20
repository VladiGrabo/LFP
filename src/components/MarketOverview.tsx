import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, BarChart3, Zap } from 'lucide-react';
import LightweightChart from './LightweightChart';

interface MarketOverviewProps {
  onNavigateToTrading?: (asset: string, tradingType?: 'spot' | 'margin') => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ onNavigateToTrading }) => {
  const [selectedMarket, setSelectedMarket] = useState('crypto');
  const [selectedAssetForChart, setSelectedAssetForChart] = useState('BTC');
  const [selectedInterval, setSelectedInterval] = useState('D');

  const markets = {
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'ETH', name: 'Ethereum', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'BNB', name: 'Binance Coin', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'SOL', name: 'Solana', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'XRP', name: 'Ripple', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
    ],
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'MSFT', name: 'Microsoft Corp', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'TSLA', name: 'Tesla Inc', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'NVDA', name: 'NVIDIA Corp', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
    ],
    forex: [
      { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'GBP/USD', name: 'Pound/US Dollar', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
    ],
    commodities: [
      { symbol: 'Gold', name: 'Gold Spot', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'Silver', name: 'Silver Spot', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'Oil', name: 'Crude Oil WTI', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'Natural Gas', name: 'Natural Gas', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
      { symbol: 'Copper', name: 'Copper', price: 'TradingView', change: '', volume: 'TradingView', positive: true },
    ],
  };

  const marketCategories = [
    { key: 'crypto', label: 'Cryptocurrency', icon: Activity },
    { key: 'stocks', label: 'Stock Market', icon: TrendingUp },
    { key: 'forex', label: 'Forex', icon: Globe },
    { key: 'commodities', label: 'Commodities', icon: TrendingDown },
  ];

  const handleAssetClick = (asset: any) => {
    setSelectedAssetForChart(asset.symbol);
  };

  const handleTradeClick = (asset: any, tradingType: 'spot' | 'margin' = 'spot') => {
    if (onNavigateToTrading) {
      onNavigateToTrading(asset.symbol, tradingType);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Market Overview</h2>
        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          <span>TradingView Powered</span>
        </div>
      </div>

      {/* Market Categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {marketCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.key}
              onClick={() => setSelectedMarket(category.key)}
              className={`p-3 md:p-4 rounded-xl border transition-colors ${
                selectedMarket === category.key
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <Icon className="h-4 w-4 md:h-6 md:w-6" />
                <span className="font-medium text-xs md:text-base">{category.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Section - TradingView */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedAssetForChart} - Профессиональный график TradingView
          </h3>
          <div className="flex space-x-1 mt-2 sm:mt-0">
            {['1', '5', '15', '60', 'D', 'W', 'M'].map((interval) => (
              <button
                key={interval}
                onClick={() => setSelectedInterval(interval)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedInterval === interval
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interval === '1' ? '1м' : interval === '5' ? '5м' : interval === '15' ? '15м' : interval === '60' ? '1ч' : interval === 'D' ? '1Д' : interval === 'W' ? '1Н' : '1М'}
              </button>
            ))}
          </div>
        </div>
        <LightweightChart symbol={selectedAssetForChart} height={600} />
      </div>

      {/* Market Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 capitalize text-gray-900">{selectedMarket} Market</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 text-xs md:text-sm border-b border-gray-200">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Data Source</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {markets[selectedMarket as keyof typeof markets]?.map((asset, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm md:text-base">{asset.symbol}</div>
                      <div className="text-xs md:text-sm text-gray-600">{asset.name}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600 font-medium">TradingView</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleAssetClick(asset)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-1 rounded transition-colors text-xs md:text-sm flex items-center space-x-1"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Chart</span>
                      </button>
                      <button 
                        onClick={() => handleTradeClick(asset, 'spot')}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1 rounded transition-colors text-xs md:text-sm flex items-center space-x-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span className="hidden sm:inline">Spot</span>
                      </button>
                      {selectedMarket === 'crypto' && (
                        <button 
                          onClick={() => handleTradeClick(asset, 'margin')}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-2 md:px-3 py-1 rounded transition-colors text-xs md:text-sm flex items-center space-x-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span className="hidden sm:inline">Margin</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            <span className="text-gray-600 text-sm md:text-base">Market Cap</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">$2.45T</div>
          <div className="text-sm text-green-500">+2.34%</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            <span className="text-gray-600 text-sm md:text-base">24h Volume</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">$89.2B</div>
          <div className="text-sm text-blue-500">+5.67%</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            <span className="text-gray-600 text-sm md:text-base">Active Markets</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">1,247</div>
          <div className="text-sm text-purple-500">+12 new</div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;