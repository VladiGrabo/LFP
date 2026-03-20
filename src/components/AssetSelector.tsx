import React, { useState } from 'react';
import { Search, Star, TrendingUp, BarChart3 } from 'lucide-react';

interface AssetSelectorProps {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  onAssetSelect?: (asset: string) => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  setSelectedAsset,
  onAssetSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allAssets = [
    { symbol: 'BTC', name: 'Bitcoin', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'BNB', name: 'Binance Coin', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'SOL', name: 'Solana', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'XRP', name: 'Ripple', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'ADA', name: 'Cardano', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'AVAX', name: 'Avalanche', price: 'TradingView', change: '', positive: true, category: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc', price: 'TradingView', change: '', positive: true, category: 'stocks' },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 'TradingView', change: '', positive: true, category: 'stocks' },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: 'TradingView', change: '', positive: true, category: 'stocks' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: 'TradingView', change: '', positive: true, category: 'stocks' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 'TradingView', change: '', positive: true, category: 'stocks' },
    { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 'TradingView', change: '', positive: true, category: 'forex' },
    { symbol: 'GBP/USD', name: 'Pound/US Dollar', price: 'TradingView', change: '', positive: true, category: 'forex' },
    { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', price: 'TradingView', change: '', positive: true, category: 'forex' },
    { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', price: 'TradingView', change: '', positive: true, category: 'forex' },
    { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', price: 'TradingView', change: '', positive: true, category: 'forex' },
    { symbol: 'Gold', name: 'Gold Spot', price: 'TradingView', change: '', positive: true, category: 'commodities' },
    { symbol: 'Silver', name: 'Silver Spot', price: 'TradingView', change: '', positive: true, category: 'commodities' },
    { symbol: 'Oil', name: 'Crude Oil WTI', price: 'TradingView', change: '', positive: true, category: 'commodities' },
    { symbol: 'Natural Gas', name: 'Natural Gas', price: 'TradingView', change: '', positive: true, category: 'commodities' },
    { symbol: 'Copper', name: 'Copper', price: 'TradingView', change: '', positive: true, category: 'commodities' },
  ];

  const categories = ['All', 'Crypto', 'Stocks', 'Forex', 'Commodities'];

  // Исправленная фильтрация по категориям
  const filteredAssets = allAssets.filter(asset => {
    // Фильтрация по категории
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Crypto') {
      matchesCategory = asset.category === 'crypto';
    } else if (selectedCategory === 'Stocks') {
      matchesCategory = asset.category === 'stocks';
    } else if (selectedCategory === 'Forex') {
      matchesCategory = asset.category === 'forex';
    } else if (selectedCategory === 'Commodities') {
      matchesCategory = asset.category === 'commodities';
    }

    // Фильтрация по поисковому запросу
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleAssetClick = (assetSymbol: string) => {
    setSelectedAsset(assetSymbol);
    if (onAssetSelect) {
      onAssetSelect(assetSymbol);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Select Asset</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 text-gray-900 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 w-full sm:w-auto text-sm md:text-base"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-xs md:text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Показываем количество найденных активов */}
      <div className="mb-4 text-sm text-gray-600">
        Найдено активов: {filteredAssets.length}
        {selectedCategory !== 'All' && (
          <span className="ml-2 text-blue-600">
            в категории "{selectedCategory}"
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredAssets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => handleAssetClick(asset.symbol)}
            className={`p-3 rounded-lg text-left transition-all duration-200 border group hover:shadow-md ${
              selectedAsset === asset.symbol
                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-md'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm md:text-base">{asset.symbol}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                <BarChart3 className={`h-3 w-3 md:h-4 md:w-4 transition-colors ${
                  selectedAsset === asset.symbol
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-blue-500'
                }`} />
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-2 truncate">{asset.name}</p>
            <div className="flex items-center justify-center">
              <span className="text-xs text-blue-600 font-medium">View on TradingView</span>
            </div>
            
            {/* Индикатор выбранного актива */}
            {selectedAsset === asset.symbol && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                <BarChart3 className="h-3 w-3" />
                <span>График открыт</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Сообщение если ничего не найдено */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search className="h-8 w-8 md:h-12 md:w-12 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Активы не найдены</p>
          <p className="text-gray-500 text-sm">
            {searchTerm 
              ? `Попробуйте изменить поисковый запрос "${searchTerm}"`
              : `В категории "${selectedCategory}" нет доступных активов`
            }
          </p>
        </div>
      )}

      {/* Информация об источнике данных */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">TradingView Charts</span>
        </div>
        <p className="text-xs text-blue-700">
          Все котировки и графики предоставляются TradingView - профессиональная платформа для трейдинга
        </p>
      </div>
    </div>
  );
};

export default AssetSelector;