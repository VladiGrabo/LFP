import React, { useEffect } from 'react';
import { CheckCircle, X, TrendingUp, TrendingDown, Copy, ExternalLink } from 'lucide-react';

interface TradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPortfolio?: () => void; // Добавляем новый проп
  tradeData: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: string;
    price: number;
    orderType: 'spot' | 'margin';
    leverage?: string;
    orderId: string;
    timestamp: string;
  };
}

const TradeSuccessModal: React.FC<TradeSuccessModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPortfolio,
  tradeData
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Автоматически закрываем через 5 секунд

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBuy = tradeData.side === 'buy';
  const isMarginTrade = tradeData.orderType === 'margin';
  const totalValue = tradeData.price * parseFloat(tradeData.amount);

  const copyOrderId = () => {
    navigator.clipboard.writeText(tradeData.orderId);
  };

  const handlePortfolioClick = () => {
    onClose();
    if (onNavigateToPortfolio) {
      onNavigateToPortfolio();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Сделка выполнена!
              </h3>
              <p className="text-sm text-gray-600">
                Ваш ордер успешно размещен
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Trade Details */}
        <div className="p-6 space-y-4">
          {/* Order Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              {isBuy ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900">
                {isBuy ? 'Покупка' : 'Продажа'} {tradeData.symbol}
              </span>
              {isMarginTrade && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                  {tradeData.leverage}x
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Количество:</span>
                <div className="font-medium">{tradeData.amount}</div>
              </div>
              <div>
                <span className="text-gray-600">Цена:</span>
                <div className="font-medium">${tradeData.price.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Общая стоимость:</span>
                <div className="font-medium">${totalValue.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Тип:</span>
                <div className="font-medium capitalize">
                  {isMarginTrade ? 'Маржа' : 'Спот'}
                </div>
              </div>
            </div>
          </div>

          {/* Order ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">ID ордера:</span>
                <div className="font-mono text-sm font-medium text-gray-900">
                  {tradeData.orderId}
                </div>
              </div>
              <button
                onClick={copyOrderId}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Копировать ID"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-sm text-gray-500">
            Время выполнения: {new Date(tradeData.timestamp).toLocaleString('ru-RU')}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Что дальше?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Отслеживайте позицию в разделе "Портфолио"</li>
              <li>• Установите стоп-лосс для управления рисками</li>
              {isMarginTrade && (
                <li>• Следите за уровнем маржи и ценой ликвидации</li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Закрыть
            </button>
            <button
              onClick={handlePortfolioClick}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Портфолио</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSuccessModal;