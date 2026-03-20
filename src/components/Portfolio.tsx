import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, X, AlertTriangle, Zap, History, BarChart3, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { usePositions, usePortfolioStats, useAllTrades } from '../hooks/useTradeService';
import { tradeService } from '../services/tradeService';

const Portfolio: React.FC = () => {
  const { positions, loading } = usePositions();
  const { trades: allTrades, loading: tradesLoading } = useAllTrades();
  const stats = usePortfolioStats();
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  // Слушаем события переключения вкладок из других компонентов
  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab === 'positions' || tab === 'history') {
        setActiveTab(tab);
      }
    };

    window.addEventListener('portfolioTabSwitch', handleTabSwitch as EventListener);
    
    return () => {
      window.removeEventListener('portfolioTabSwitch', handleTabSwitch as EventListener);
    };
  }, []);

  const handleClosePosition = (positionId: string) => {
    if (window.confirm('Вы уверены, что хотите закрыть эту позицию?')) {
      const success = tradeService.closePosition(positionId);
      if (success) {
        console.log('✅ Position closed successfully');
      } else {
        alert('Ошибка при закрытии позиции');
      }
    }
  };

  // Функция для форматирования символа
  const formatSymbol = (symbol: string) => {
    if (symbol.endsWith('USDT')) {
      return symbol.replace('USDT', '/USD');
    }
    if (symbol.includes('/')) {
      return symbol;
    }
    return symbol;
  };

  // Функция для получения названия актива
  const getAssetName = (symbol: string) => {
    const names: { [key: string]: string } = {
      'BTCUSDT': 'Bitcoin',
      'ETHUSDT': 'Ethereum', 
      'BNBUSDT': 'Binance Coin',
      'SOLUSDT': 'Solana',
      'ADAUSDT': 'Cardano',
      'AAPL': 'Apple Inc',
      'MSFT': 'Microsoft Corp',
      'TSLA': 'Tesla Inc',
      'GOOGL': 'Alphabet Inc',
      'NVDA': 'NVIDIA Corp'
    };
    return names[symbol] || symbol;
  };

  // Функция для определения категории актива
  const getAssetCategory = (symbol: string): 'crypto' | 'stocks' | 'forex' | 'commodities' => {
    if (symbol.endsWith('USDT') || symbol.endsWith('USD') && symbol.length <= 7) {
      return 'crypto';
    }
    if (['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'AMZN', 'META'].includes(symbol)) {
      return 'stocks';
    }
    if (symbol.includes('/') && (symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY'))) {
      return 'forex';
    }
    if (['Gold', 'Silver', 'Oil', 'Natural Gas', 'Copper'].includes(symbol)) {
      return 'commodities';
    }
    return 'stocks'; // По умолчанию
  };

  // Рассчитываем реальное распределение активов
  const calculateAssetAllocation = () => {
    if (positions.length === 0) {
      return {
        data: [
          { name: 'Cash', value: 100, color: '#6B7280', amount: 50000 }
        ],
        totalValue: 50000,
        freeBalance: 50000
      };
    }

    const categoryTotals = {
      crypto: 0,
      stocks: 0,
      forex: 0,
      commodities: 0
    };

    let totalPositionValue = 0;

    // Суммируем стоимость позиций по категориям
    positions.forEach(position => {
      const positionValue = position.entryPrice * position.amount + position.pnl;
      const category = getAssetCategory(position.symbol);
      categoryTotals[category] += positionValue;
      totalPositionValue += positionValue;
    });

    // Добавляем свободные средства (предполагаем 50% от общей стоимости портфеля)
    const freeBalance = totalPositionValue * 0.5;
    const totalValue = totalPositionValue + freeBalance;

    const allocationData = [];

    // Добавляем категории с позициями
    Object.entries(categoryTotals).forEach(([category, value]) => {
      if (value > 0) {
        const percentage = (value / totalValue) * 100;
        const colors = {
          crypto: '#10B981',
          stocks: '#3B82F6', 
          forex: '#8B5CF6',
          commodities: '#F59E0B'
        };

        const names = {
          crypto: 'Криптовалюты',
          stocks: 'Акции',
          forex: 'Форекс',
          commodities: 'Сырьё'
        };

        allocationData.push({
          name: names[category as keyof typeof names],
          value: percentage,
          color: colors[category as keyof typeof colors],
          amount: value
        });
      }
    });

    // Добавляем свободные средства
    if (freeBalance > 0) {
      allocationData.push({
        name: 'Свободные средства',
        value: (freeBalance / totalValue) * 100,
        color: '#6B7280',
        amount: freeBalance
      });
    }

    return {
      data: allocationData,
      totalValue,
      freeBalance
    };
  };

  const allocation = calculateAssetAllocation();

  // Фильтруем закрытые сделки
  const closedTrades = allTrades.filter(trade => trade.status === 'closed');
  const openTrades = allTrades.filter(trade => trade.status === 'open');

  if (loading || tradesLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Portfolio Overview</h2>
        <div className="flex items-center space-x-4 text-xs md:text-sm">
          <div className="flex items-center space-x-2">
            <Wallet className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            <span className="text-gray-600">Total Portfolio Value:</span>
            <span className="text-green-600 font-semibold">
              ${allocation.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            <span className="text-gray-600 text-sm md:text-base">Total Value</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            ${allocation.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Invested: ${(allocation.totalValue - allocation.freeBalance).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            <span className="text-gray-600 text-sm md:text-base">Total P&L</span>
          </div>
          <div className={`text-xl md:text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
          </div>
          <div className={`text-sm ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
            <span className="text-gray-600 text-sm md:text-base">Free Balance</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            ${allocation.freeBalance.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {((allocation.freeBalance / allocation.totalValue) * 100).toFixed(1)}% available
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            <span className="text-gray-600 text-sm md:text-base">Open Positions</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.openPositionsCount}</div>
          <div className="text-sm text-gray-600">
            {closedTrades.length} closed, {openTrades.length} open
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Asset Allocation</h3>
        
        {allocation.data.length === 1 && allocation.data[0].name === 'Свободные средства' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Все средства свободны</p>
            <p className="text-gray-500 text-sm">
              Откройте позиции для диверсификации портфеля
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allocation.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${item.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.value.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Визуальная полоса распределения */}
        {allocation.data.length > 1 && (
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
              {allocation.data.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color
                  }}
                  className="transition-all duration-300"
                  title={`${item.name}: ${item.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('positions')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors border-b-2 ${
                activeTab === 'positions'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Open Positions</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'positions' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {positions.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <History className="h-4 w-4" />
                <span>Trade History</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {closedTrades.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'positions' ? (
            // Open Positions Tab
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
                <div className="text-sm text-gray-600">
                  {positions.length} active position{positions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Нет открытых позиций</p>
                  <p className="text-gray-500 text-sm">
                    Откройте первую сделку в разделах Spot Trading или Margin Trading
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 text-xs md:text-sm border-b border-gray-200">
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Side</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Entry Price</th>
                        <th className="pb-3">Current Price</th>
                        <th className="pb-3">P&L</th>
                        <th className="pb-3">P&L %</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm md:text-base">
                                {formatSymbol(position.symbol)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {getAssetName(position.symbol)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                position.orderType === 'margin' 
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {position.orderType === 'margin' ? 'Margin' : 'Spot'}
                              </span>
                              {position.leverage && (
                                <span className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                                  <Zap className="w-3 h-3" />
                                  <span>{position.leverage}x</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              position.side === 'long' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {position.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 text-gray-700 text-sm md:text-base">
                            {position.amount}
                          </td>
                          <td className="py-4 font-mono text-gray-900 text-sm md:text-base">
                            ${position.entryPrice.toFixed(2)}
                          </td>
                          <td className="py-4 font-mono text-gray-900 text-sm md:text-base">
                            ${position.currentPrice.toFixed(2)}
                          </td>
                          <td className={`py-4 font-medium text-sm md:text-base ${
                            position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                          </td>
                          <td className={`py-4 text-sm md:text-base ${
                            position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div className="flex items-center space-x-1">
                              {position.pnl >= 0 ? (
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                              <span>{position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => handleClosePosition(position.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors flex items-center space-x-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Close</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Trade History Tab
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trade History</h3>
                <div className="text-sm text-gray-600">
                  {closedTrades.length} completed trade{closedTrades.length !== 1 ? 's' : ''}
                </div>
              </div>

              {closedTrades.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Нет закрытых сделок</p>
                  <p className="text-gray-500 text-sm">
                    Закрытые сделки будут отображаться здесь после завершения
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 text-xs md:text-sm border-b border-gray-200">
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Side</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Entry Price</th>
                        <th className="pb-3">Exit Price</th>
                        <th className="pb-3">P&L</th>
                        <th className="pb-3">P&L %</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm md:text-base">
                                {formatSymbol(trade.symbol)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {getAssetName(trade.symbol)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                trade.orderType === 'margin' 
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {trade.orderType === 'margin' ? 'Margin' : 'Spot'}
                              </span>
                              {trade.leverage && (
                                <span className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                                  <Zap className="w-3 h-3" />
                                  <span>{trade.leverage}x</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.side === 'buy' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {trade.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 text-gray-700 text-sm md:text-base">
                            {trade.amount}
                          </td>
                          <td className="py-4 font-mono text-gray-900 text-sm md:text-base">
                            ${trade.openPrice.toFixed(2)}
                          </td>
                          <td className="py-4 font-mono text-gray-900 text-sm md:text-base">
                            ${(trade.closePrice || trade.currentPrice || trade.price).toFixed(2)}
                          </td>
                          <td className={`py-4 font-medium text-sm md:text-base ${
                            (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                          </td>
                          <td className={`py-4 text-sm md:text-base ${
                            (trade.pnlPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div className="flex items-center space-x-1">
                              {(trade.pnlPercent || 0) >= 0 ? (
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                              <span>
                                {(trade.pnlPercent || 0) >= 0 ? '+' : ''}{(trade.pnlPercent || 0).toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(trade.closeTimestamp || trade.timestamp).toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              <CheckCircle className="w-3 h-3" />
                              <span>Closed</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Risk Warning for Margin Positions */}
      {positions.some(p => p.orderType === 'margin') && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 mb-1">Маржинальные позиции</h4>
              <p className="text-sm text-orange-700">
                У вас есть открытые маржинальные позиции с плечом. Следите за ценами ликвидации 
                и уровнем маржи. Рынок может быть волатильным.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;