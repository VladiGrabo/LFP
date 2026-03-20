import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calculator, Zap } from 'lucide-react';
import { useReliableMarketData } from '../hooks/useReliableMarketData';
import { tradeService } from '../services/tradeService';
import TradeConfirmationModal from './TradeConfirmationModal';
import TradeSuccessModal from './TradeSuccessModal';

interface MarginOrderFormProps {
  selectedAsset: string;
  onNavigateToPortfolio?: () => void; // Добавляем новый проп
}

const MarginOrderForm: React.FC<MarginOrderFormProps> = ({ 
  selectedAsset, 
  onNavigateToPortfolio 
}) => {
  const { data: marketData } = useReliableMarketData(selectedAsset);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState('10');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [requiredMargin, setRequiredMargin] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [availableMargin] = useState(25000); // Mock margin balance
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTradeData, setLastTradeData] = useState<any>(null);

  const leverageOptions = ['2', '5', '10', '20', '50', '100'];

  useEffect(() => {
    if (marketData && amount) {
      const currentPrice = type === 'market' ? marketData.price : parseFloat(price) || marketData.price;
      const cost = currentPrice * parseFloat(amount);
      const margin = cost / parseInt(leverage);
      const liqPrice = side === 'buy' 
        ? currentPrice * (1 - 0.8 / parseInt(leverage))
        : currentPrice * (1 + 0.8 / parseInt(leverage));
      
      setEstimatedCost(cost);
      setRequiredMargin(margin);
      setLiquidationPrice(liqPrice);
    }
  }, [marketData, amount, price, type, leverage, side]);

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

    if (requiredMargin > availableMargin) {
      alert('Недостаточно маржи для выполнения ордера');
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
        leverage,
        orderType: 'margin',
        currentPrice: marketData.price,
        dataSource: marketData.source
      });

      setLastTradeData({
        symbol: selectedAsset,
        side,
        amount,
        price: trade.price,
        orderType: 'margin' as const,
        leverage,
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

      console.log('✅ Margin trade executed successfully:', trade);
    } catch (error) {
      console.error('❌ Failed to execute margin trade:', error);
      alert('Ошибка при выполнении маржинальной сделки');
    }
  };

  const maxAmount = marketData ? ((availableMargin * parseInt(leverage)) / marketData.price).toFixed(6) : '0';

  const tradeData = {
    symbol: selectedAsset,
    side,
    type,
    amount,
    price,
    leverage,
    orderType: 'margin' as const,
    estimatedCost,
    requiredMargin,
    liquidationPrice,
    dataSource: marketData?.source
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Margin Order</h3>
          <div className="flex items-center space-x-1 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">High Risk</span>
          </div>
        </div>

        {/* Информация о источнике данных */}
        {marketData && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">Текущая цена:</span>
              <div className="text-right">
                <div className="font-medium text-orange-900">${marketData.price.toFixed(2)}</div>
                <div className="text-xs text-orange-600">Источник: {marketData.source}</div>
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
            Long
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm md:text-base ${
              side === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Short
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            <Zap className="inline h-4 w-4 mr-1" />
            Leverage
          </label>
          <div className="grid grid-cols-3 gap-1">
            {leverageOptions.map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`py-2 text-sm rounded transition-colors ${
                  leverage === lev
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
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
              <button
                onClick={() => setAmount(maxAmount)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Max: {maxAmount}
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="w-full bg-gray-50 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-sm md:text-base"
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Available Margin:</span>
              <span className="text-gray-900 font-medium">${availableMargin.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Required Margin:</span>
              <span className="text-gray-900 font-medium">${requiredMargin.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Position Size:</span>
              <span className="text-gray-900 font-medium">${estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-600">Liquidation Price:</span>
              <span className="text-orange-600 font-medium">${liquidationPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={!amount || requiredMargin > availableMargin}
            className={`w-full py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
              side === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300'
            }`}
          >
            Open {side === 'buy' ? 'Long' : 'Short'} Position ({leverage}x)
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

export default MarginOrderForm;