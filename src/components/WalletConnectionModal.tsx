import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Shield, 
  Globe, 
  Smartphone, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import NetworkSelector from './NetworkSelector';
import BybitWalletConnect from './BybitWalletConnect';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (walletData: any) => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<'ethereum' | 'bsc' | 'ton'>('ethereum');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [step, setStep] = useState<'network' | 'wallet' | 'connect'>('network');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletOptions = [
    {
      id: 'bybit',
      name: 'Bybit Wallet',
      description: 'Официальный кошелек Bybit с поддержкой всех сетей',
      icon: Wallet,
      color: 'orange',
      supported: ['ethereum', 'bsc', 'ton'],
      features: ['Мультисеть', 'Безопасность', 'Простота использования'],
      downloadUrl: 'https://www.bybit.com/wallet'
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Популярный кошелек для Ethereum и EVM сетей',
      icon: Globe,
      color: 'yellow',
      supported: ['ethereum', 'bsc'],
      features: ['EVM совместимость', 'DeFi интеграция', 'Широкая поддержка'],
      downloadUrl: 'https://metamask.io'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      description: 'Мобильный кошелек с поддержкой множества сетей',
      icon: Shield,
      color: 'blue',
      supported: ['ethereum', 'bsc'],
      features: ['Мобильное приложение', 'DeFi браузер', 'Стейкинг'],
      downloadUrl: 'https://trustwallet.com'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Подключение любого совместимого кошелька через QR код',
      icon: Smartphone,
      color: 'purple',
      supported: ['ethereum', 'bsc'],
      features: ['QR подключение', 'Универсальность', 'Безопасность'],
      downloadUrl: 'https://walletconnect.com'
    }
  ];

  const supportedWallets = walletOptions.filter(wallet => 
    wallet.supported.includes(selectedNetwork)
  );

  const handleNetworkNext = () => {
    setStep('wallet');
    setError(null);
  };

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    if (walletId === 'bybit') {
      setStep('connect');
    } else {
      setError(`Подключение ${walletOptions.find(w => w.id === walletId)?.name} будет доступно в следующих обновлениях`);
    }
  };

  const handleBybitConnect = async (walletData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Передаем информацию о выбранной сети
      const walletWithNetwork = {
        ...walletData,
        preferredNetwork: selectedNetwork
      };
      
      if (onConnect) {
        await onConnect(walletWithNetwork);
      }
      
      onClose();
    } catch (error: any) {
      setError(error.message || 'Ошибка подключения кошелька');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'wallet') {
      setStep('network');
    } else if (step === 'connect') {
      setStep('wallet');
    }
    setError(null);
  };

  const getNetworkName = (network: string) => {
    const names = {
      ethereum: 'Ethereum',
      bsc: 'Binance Smart Chain',
      ton: 'TON Network'
    };
    return names[network as keyof typeof names] || network;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Подключение кошелька
              </h3>
              <p className="text-sm text-gray-600">
                {step === 'network' && 'Выберите блокчейн сеть'}
                {step === 'wallet' && `Выберите кошелек для ${getNetworkName(selectedNetwork)}`}
                {step === 'connect' && 'Подключение Bybit Wallet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              step === 'network' ? 'text-blue-600' : 'text-green-600'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'network' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {step === 'network' ? '1' : <CheckCircle className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium">Сеть</span>
            </div>
            
            <div className={`w-8 h-0.5 ${
              ['wallet', 'connect'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            
            <div className={`flex items-center space-x-2 ${
              step === 'wallet' ? 'text-blue-600' : 
              step === 'connect' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'wallet' ? 'bg-blue-100 text-blue-600' :
                step === 'connect' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {step === 'connect' ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Кошелек</span>
            </div>
            
            <div className={`w-8 h-0.5 ${
              step === 'connect' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            
            <div className={`flex items-center space-x-2 ${
              step === 'connect' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'connect' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Подключение</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {step === 'network' && (
            <div className="space-y-6">
              <NetworkSelector
                selectedNetwork={selectedNetwork}
                onNetworkChange={setSelectedNetwork}
              />
              
              <div className="flex justify-end">
                <button
                  onClick={handleNetworkNext}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Продолжить
                </button>
              </div>
            </div>
          )}

          {step === 'wallet' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Выбранная сеть: {getNetworkName(selectedNetwork)}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Показаны только кошельки, поддерживающие эту сеть
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedWallets.map((wallet) => {
                  const Icon = wallet.icon;
                  return (
                    <div
                      key={wallet.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedWallet === wallet.id
                          ? `border-${wallet.color}-500 bg-${wallet.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleWalletSelect(wallet.id)}
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-12 h-12 bg-${wallet.color}-100 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${wallet.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{wallet.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {wallet.features.map((feature, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full bg-${wallet.color}-100 text-${wallet.color}-700`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Поддерживает: {wallet.supported.map(net => getNetworkName(net)).join(', ')}
                        </div>
                        <a
                          href={wallet.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                {selectedWallet && (
                  <button
                    onClick={() => handleWalletSelect(selectedWallet)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Подключение...</span>
                      </div>
                    ) : (
                      'Подключить'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'connect' && selectedWallet === 'bybit' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Настройки подключения
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <div>Сеть: {getNetworkName(selectedNetwork)}</div>
                  <div>Кошелек: Bybit Wallet</div>
                </div>
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 pt-4">
                <BybitWalletConnect 
                  onConnect={handleBybitConnect}
                  onClose={() => {}} // Не показываем кнопку закрытия в модальном режиме
                />
              </div>

              <div className="flex justify-start">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;