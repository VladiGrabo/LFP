import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecentTradesProps {
  onNavigateToPortfolio?: () => void;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ onNavigateToPortfolio }) => {
  const trades = [
    { 
      symbol: 'BTC/USD', 
      type: 'BUY', 
      amount: '0.5', 
      price: '43,250.00', 
      profit: '+$1,234.50', 
      time: '10:32 AM',
      status: 'open'
    },
    { 
      symbol: 'AAPL', 
      type: 'SELL', 
      amount: '100', 
      price: '182.45', 
      profit: '-$245.20', 
      time: '09:45 AM',
      status: 'closed'
    },
    { 
      symbol: 'EUR/USD', 
      type: 'BUY', 
      amount: '10,000', 
      price: '1.0845', 
      profit: '+$89.30', 
      time: '09:12 AM',
      status: 'open'
    },
    { 
      symbol: 'Gold', 
      type: 'BUY', 
      amount: '2 oz', 
      price: '2,025.50', 
      profit: '+$156.75', 
      time: '08:58 AM',
      status: 'closed'
    },
    { 
      symbol: 'ETH/USD', 
      type: 'SELL', 
      amount: '5', 
      price: '2,345.80', 
      profit: '+$567.45', 
      time: '08:23 AM',
      status: 'open'
    },
  ];

  const handleTradeClick = (trade: any) => {
    if (onNavigateToPortfolio) {
      onNavigateToPortfolio();
      
      // Небольшая задержка для перехода на страницу портфолио, затем переключение на нужную вкладку
      setTimeout(() => {
        // Эмулируем клик по соответствующей вкладке в портфолио
        const event = new CustomEvent('portfolioTabSwitch', { 
          detail: { tab: trade.status === 'open' ? 'positions' : 'history' }
        });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Trades</h3>
      <div className="space-y-3">
        {trades.map((trade, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => handleTradeClick(trade)}
            title={`Click to view ${trade.status === 'open' ? 'open positions' : 'trade history'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'}`}>
                {trade.type === 'BUY' ? (
                  <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 text-sm md:text-base">{trade.symbol}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trade.status === 'open' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {trade.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{trade.type} {trade.amount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 text-sm md:text-base">${trade.price}</p>
              <p className={`text-xs md:text-sm ${trade.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trade.profit}
              </p>
            </div>
            <div className="text-xs md:text-sm text-gray-600 hidden sm:block">
              {trade.time}
            </div>
          </div>
        ))}
      </div>
      
      {/* Кнопка для перехода к полному портфолио */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onNavigateToPortfolio && onNavigateToPortfolio()}
          className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          View All Trades →
        </button>
      </div>
    </div>
  );
};

export default RecentTrades;