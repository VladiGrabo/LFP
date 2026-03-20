import React from 'react';
import { TrendingUp, BarChart3, Zap, Activity } from 'lucide-react';

interface MarketMoverProps {
  onNavigateToTrading?: (asset: string, tradingType?: 'spot' | 'margin') => void;
}

const MarketMover: React.FC<MarketMoverProps> = ({ onNavigateToTrading }) => {
  const topAssets = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'AVAX', name: 'Avalanche' },
  ];

  const handleTradeClick = (symbol: string, tradingType: 'spot' | 'margin' = 'spot') => {
    if (onNavigateToTrading) {
      onNavigateToTrading(symbol, tradingType);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Assets</h3>
      <div className="space-y-3">
        {topAssets.map((asset, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 text-sm md:text-base">{asset.symbol}</p>
                <div className="flex items-center space-x-2">
                  <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">TradingView</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-gray-600">{asset.name}</p>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleTradeClick(asset.symbol, 'spot')}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>Spot</span>
                  </button>
                  <button
                    onClick={() => handleTradeClick(asset.symbol, 'margin')}
                    className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Margin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => handleTradeClick('BTC', 'spot')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          Start Trading
        </button>
      </div>
    </div>
  );
};

export default MarketMover;