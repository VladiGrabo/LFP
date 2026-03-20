import React from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Shield, Zap } from 'lucide-react';

interface TradeData {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: string;
  price?: string;
  leverage?: string;
  orderType: 'spot' | 'margin';
  estimatedCost: number;
  requiredMargin?: number;
  liquidationPrice?: number;
  dataSource?: string;
}

interface TradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tradeData: TradeData;
  currentPrice: number;
}

const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tradeData,
  currentPrice
}) => {
  if (!isOpen) return null;

  const isMarginTrade = tradeData.orderType === 'margin';
  const isBuy = tradeData.side === 'buy';
  const isLong = isBuy && isMarginTrade;
  const isShort = !isBuy && isMarginTrade;

  const executionPrice = tradeData.type === 'market' 
    ? currentPrice 
    : parseFloat(tradeData.price || '0');

  const totalValue = executionPrice * parseFloat(tradeData.amount);
  const leverage = parseInt(tradeData.leverage || '1');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isBuy ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isBuy ? (
                <TrendingUp className={`h-5 w-5 ${isBuy ? 'text-green-600' : 'text-red-600'}`} />
              ) : (
                <TrendingDown className={`h-5 w-5 ${isBuy ? 'text-green-600' : 'text-red-600'}`} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Подтверждение сделки
              </h3>
              <p className="text-sm text-gray-600">
                {isMarginTrade ? (
                  isLong ? `Long позиция ${leverage}x` : `Short позиция ${leverage}x`
                ) : (
                  isBuy ? 'Покупка' : 'Продажа'
                )}
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
          {/* Asset and Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Актив</span>
              <span className="font-medium text-gray-900">{tradeData.symbol}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Количество</span>
              <span className="font-medium text-gray-900">{tradeData.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Тип ордера</span>
              <span className="font-medium text-gray-900 capitalize">
                {tradeData.type === 'market' ? 'Рыночный' : 'Лимитный'}
              </span>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-blue-700">Текущая цена</span>
              <span className="font-medium text-blue-900">${currentPrice.toFixed(2)}</span>
            </div>
            {tradeData.type === 'limit' && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-blue-700">Лимитная цена</span>
                <span className="font-medium text-blue-900">${parseFloat(tradeData.price || '0').toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Цена исполнения</span>
              <span className="font-medium text-blue-900">${executionPrice.toFixed(2)}</span>
            </div>
            {tradeData.dataSource && (
              <div className="mt-2 text-xs text-blue-600">
                Источник данных: {tradeData.dataSource}
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Общая стоимость</span>
              <span className="font-medium text-gray-900">${totalValue.toFixed(2)}</span>
            </div>
            
            {isMarginTrade && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Плечо</span>
                  <span className="font-medium text-orange-600">{leverage}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Требуемая маржа</span>
                  <span className="font-medium text-gray-900">${(tradeData.requiredMargin || 0).toFixed(2)}</span>
                </div>
                {tradeData.liquidationPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Цена ликвидации</span>
                    <span className="font-medium text-red-600">${tradeData.liquidationPrice.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Risk Warning for Margin */}
          {isMarginTrade && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Предупреждение о рисках</h4>
                  <p className="text-sm text-red-700">
                    Маржинальная торговля с плечом {leverage}x может привести к значительным потерям. 
                    Ваша позиция будет автоматически закрыта при достижении цены ликвидации.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Spot Trading Info */}
          {!isMarginTrade && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Спот торговля</h4>
                  <p className="text-sm text-green-700">
                    Безопасная торговля без использования заемных средств. 
                    Вы покупаете/продаете активы за собственные средства.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isBuy
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isMarginTrade && <Zap className="h-4 w-4" />}
              <span>
                {isMarginTrade 
                  ? (isLong ? 'Открыть Long' : 'Открыть Short')
                  : (isBuy ? 'Купить' : 'Продать')
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeConfirmationModal;