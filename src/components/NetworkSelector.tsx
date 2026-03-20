import React, { useState } from 'react';
import { Globe, ChevronDown, Check, Wifi, Shield, Zap } from 'lucide-react';

interface NetworkOption {
  id: 'ethereum' | 'bsc' | 'ton';
  name: string;
  fullName: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
}

interface NetworkSelectorProps {
  selectedNetwork: 'ethereum' | 'bsc' | 'ton';
  onNetworkChange: (network: 'ethereum' | 'bsc' | 'ton') => void;
  disabled?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const networks: NetworkOption[] = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      fullName: 'Ethereum Mainnet',
      icon: '⟠',
      color: 'purple',
      description: 'Самая популярная сеть для DeFi и NFT',
      features: ['ERC-20 токены', 'DeFi протоколы', 'NFT маркетплейсы']
    },
    {
      id: 'bsc',
      name: 'BSC',
      fullName: 'Binance Smart Chain',
      icon: '🟡',
      color: 'yellow',
      description: 'Быстрая и дешевая альтернатива Ethereum',
      features: ['BEP-20 токены', 'Низкие комиссии', 'PancakeSwap']
    },
    {
      id: 'ton',
      name: 'TON',
      fullName: 'The Open Network',
      icon: '💎',
      color: 'blue',
      description: 'Высокоскоростная сеть с поддержкой Jetton токенов',
      features: ['Jetton токены', 'Мгновенные транзакции', 'Telegram интеграция']
    }
  ];

  const selectedNetworkData = networks.find(n => n.id === selectedNetwork);

  const handleNetworkSelect = (network: NetworkOption) => {
    onNetworkChange(network.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Выберите блокчейн сеть
      </label>
      
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{selectedNetworkData?.icon}</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">{selectedNetworkData?.fullName}</div>
            <div className="text-sm text-gray-600">{selectedNetworkData?.description}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => handleNetworkSelect(network)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                selectedNetwork === network.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-xl mt-1">{network.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{network.fullName}</span>
                      {selectedNetwork === network.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{network.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {network.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full bg-${network.color}-100 text-${network.color}-700`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Информация о выбранной сети */}
      {selectedNetworkData && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Особенности сети {selectedNetworkData.name}:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {selectedNetworkData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full bg-${selectedNetworkData.color}-500`}></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Предупреждение о совместимости */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <span className="font-medium">Важно:</span> Убедитесь, что ваш кошелек поддерживает выбранную сеть. 
            Система автоматически определит правильную сеть по адресу кошелька.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkSelector;