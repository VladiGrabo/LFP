import React, { useState, useEffect } from 'react';
import { Shield, Calculator } from 'lucide-react';
import { useReliableMarketData } from '../hooks/useReliableMarketData';
import { tradeService } from '../services/tradeService';
import TradeConfirmationModal from './TradeConfirmationModal';
import TradeSuccessModal from './TradeSuccessModal';

interface SpotOrderFormProps {
  selectedAsset: string;
  onNavigateToPortfolio?: () => void; // Добавляем новый проп
}

const SpotOrderForm: React.FC<SpotOrderFormProps> = ({ 
  selectedAsset, 
  onNavigateToPortfolio 
}) => {
  const { data: marketData } = useReliableMarketData(selectedAsset);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [availableBalance] = useState(50000); // Mock balance
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTradeData, setLastTradeData] = useState<any>(null);

  useEffect(() => {
    if (marketData && amount) {
      const currentPrice = type === 'market' ? marketData.price : parseFloat(price) || marketData.price;
      const cost = currentPrice * parseFloat(amount);
      setEstimatedCost(cost);
    }
  }, [marketData, amount, price, type]);

  useEffect(() => {
    if (marketData && type === 'limit' && !price) {
      setPrice(marketData.price.toFixed(2));
    }
  }, [marketData, type]);

  const handleSubmitOrder = () => {
    if (!amount || (type === 'limit' && !price)) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (side === 'buy' && estimatedCost > availableBalance) {
      alert('Недостаточно средств для выполнения ордера');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmTrade = () => {
    if (!marketData) return;

    try {
      const trade = tradeService.executeTrade({
        symbol: selectedAsset,
        side,
        type,
        amount,
        price,
        orderType: 'spot',
        currentPrice: marketData.price,
        dataSource: marketData.source
      });

      setLastTradeData({
        symbol: selectedAsset,
        side,
        amount,
        price: trade.price,
        orderType: 'spot' as const,
        orderId: trade.id,
        timestamp: trade.timestamp
      });

      setShowConfirmation(false);
      setShowSuccess(true);
      
      // Reset form
      setAmount('');
      if (type === 'limit') {
        setPrice(marketData.price.toFixed(2));
      }

      console.log('✅ Spot trade executed successfully:', trade);
    } catch (error) {
      console.error('❌ Failed to execute trade:', error);
      alert('Ошибка при выполнении сделки');
    }
  };

  const maxBuyAmount = marketData ? (availableBalance / marketData.price).toFixed(6) : '0';

  const tradeData = {
    symbol: selectedAsset,
    side,
    type,
    amount,
    price,
    orderType: 'spot' as const,
    estimatedCost,
    dataSource: marketData?.source
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Spot Order</h3>
          <div className="flex items-center space-x-1 text-green-600">
            <Shield className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Надежные данные</span>
          </div>
        </div>

        {/* Информация о источнике данных */}
        {marketData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Текущая цена:</span>
              <div className="text-right">
                <div className="font-medium text-blue-900">${marketData.price.toFixed(2)}</div>
                <div className="text-xs text-blue-600">Источник: {marketData.source}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setSide('buy')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm md:text-base ${
              side === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm md:text-base ${
              side === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sell
          </button>
        </div>

        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setType('market')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
              type === 'market'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setType('limit')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
              type === 'limit'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Limit
          </button>
        </div>

        <div className="space-y-4">
          {type === 'limit' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Price (USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={marketData?.price.toFixed(2) || "43,250.00"}
                className="w-full bg-gray-50 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-sm md:text-base"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Amount {selectedAsset.replace('USDT', '').replace('/USD', '')}
              </label>
              {side === 'buy' && (
                <button
                  onClick={() => setAmount(maxBuyAmount)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Max: {maxBuyAmount}
                </button>
              )}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="w-full bg-gray-50 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-sm md:text-base"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Available Balance:</span>
              <span className="text-gray-900 font-medium">${availableBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated {side === 'buy' ? 'Cost' : 'Receive'}:</span>
              <span className="text-gray-900 font-medium">${estimatedCost.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={!amount || (side === 'buy' && estimatedCost > availableBalance)}
            className={`w-full py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
              side === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300'
            }`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.replace('USDT', '').replace('/USD', '')}
          </button>
        </div>
      </div>

      <TradeConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmTrade}
        tradeData={tradeData}
        currentPrice={marketData?.price || 0}
      />

      {lastTradeData && (
        <TradeSuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          onNavigateToPortfolio={onNavigateToPortfolio}
          tradeData={lastTradeData}
        />
      )}
    </>
  );
};

export default SpotOrderForm;