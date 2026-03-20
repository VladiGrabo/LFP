import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Zap,
  Shield,
  Globe,
  Activity,
  TrendingUp,
  Coins,
  Search,
  DollarSign
} from 'lucide-react';
import { bybitWalletService, BybitWalletAccount, BybitWalletTransaction } from '../services/bybitWalletService';
import NetworkSelector from './NetworkSelector';

interface BybitWalletConnectProps {
  onClose?: () => void;
  onConnect?: (walletData: any) => void;
  preferredNetwork?: 'ethereum' | 'bsc' | 'ton';
}

const BybitWalletConnect: React.FC<BybitWalletConnectProps> = ({ 
  onClose, 
  onConnect,
  preferredNetwork 
}) => {
  const [account, setAccount] = useState<BybitWalletAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BybitWalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'send'>('overview');
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    token: 'ETH'
  });
  const [selectedNetwork, setSelectedNetwork] = useState<'ethereum' | 'bsc' | 'ton'>(
    preferredNetwork || 'ethereum'
  );
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [showCustomTokenForm, setShowCustomTokenForm] = useState(false);

  useEffect(() => {
    const unsubscribe = bybitWalletService.subscribe((newAccount) => {
      setAccount(newAccount);
      if (newAccount && onConnect) {
        onConnect(newAccount);
      }
    });

    return unsubscribe;
  }, [onConnect]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const txHistory = await bybitWalletService.getTransactionHistory();
      setTransactions(txHistory);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError('Не удалось загрузить историю транзакций');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!bybitWalletService.isWalletInstalled) {
        setError('Bybit Wallet не установлен. Пожалуйста, установите расширение.');
        return;
      }

      const connectedAccount = await bybitWalletService.connect(selectedNetwork);
      
      if (onConnect) {
        onConnect(connectedAccount);
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка подключения к Bybit Wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await bybitWalletService.disconnect();
  };

  const handleRefreshBalance = async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await bybitWalletService.refreshBalance();
    } catch (error: any) {
      setError('Не удалось обновить баланс: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!sendForm.to || !sendForm.amount) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const txHash = await bybitWalletService.sendTransaction(
        sendForm.to,
        parseFloat(sendForm.amount),
        sendForm.token
      );
      
      alert(`Транзакция отправлена! Hash: ${txHash}`);
      setSendForm({ to: '', amount: '', token: 'ETH' });
      setActiveTab('transactions');
      await loadTransactions();
    } catch (error: any) {
      setError(error.message || 'Ошибка отправки транзакции');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomToken = async () => {
    if (!customTokenAddress) {
      setError('Введите адрес токена');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await bybitWalletService.addCustomToken(customTokenAddress);
      setCustomTokenAddress('');
      setShowCustomTokenForm(false);
      await handleRefreshBalance();
      alert('Токен успешно добавлен и будет отображаться при наличии баланса');
    } catch (error: any) {
      setError(error.message || 'Ошибка добавления токена');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер обмена');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (amount: number, decimals = 6) => {
    return amount.toFixed(decimals);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <X className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Подсчет общей стоимости в USD
  const getTotalUSDValue = () => {
    if (!account || !account.tokenValues) return 0;
    
    return Object.values(account.tokenValues).reduce((total, value) => total + value, 0);
  };

  // Определение блокчейна
  const getBlockchainInfo = () => {
    if (!account) return { name: 'Unknown', color: 'gray' };
    
    switch (account.blockchain) {
      case 'ton':
        return { name: 'TON Network', color: 'blue' };
      case 'bsc':
        return { name: 'BSC', color: 'yellow' };
      case 'ethereum':
      default:
        return { name: 'Ethereum', color: 'purple' };
    }
  };

  if (!bybitWalletService.isWalletInstalled) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Установите Bybit Wallet
          </h3>
          <p className="text-gray-600 mb-4">
            Для подключения к Bybit Wallet необходимо установить браузерное расширение
          </p>
          <div className="space-y-3">
            <a
              href="https://chrome.google.com/webstore/detail/bybit-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Установить для Chrome</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="text-sm text-gray-500">
              Также доступно для Firefox, Edge и других браузеров
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Подключить Bybit Wallet
          </h3>
          <p className="text-gray-600 mb-4">
            Подключите ваш Bybit Wallet для получения реальных данных с ценами токенов
          </p>
          
          {/* Выбор сети */}
          <div className="mb-6">
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkChange={setSelectedNetwork}
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            <span>{loading ? 'Подключение...' : 'Подключить Bybit Wallet'}</span>
          </button>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>Цены токенов в USD</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Coins className="w-4 h-4 text-blue-600" />
              <span>Все ваши токены</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Реальные данные</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalUSDValue = getTotalUSDValue();
  const hasBalance = Object.values(account.balance).some(balance => balance > 0);
  const blockchainInfo = getBlockchainInfo();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Bybit Wallet Connected</h3>
              <p className="text-orange-100 text-sm">
                {formatAddress(account.address)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Blockchain Badge */}
            <div className={`flex items-center space-x-1 bg-${blockchainInfo.color}-500 bg-opacity-20 px-2 py-1 rounded-full text-xs`}>
              <Globe className="w-3 h-3" />
              <span>{blockchainInfo.name}</span>
            </div>
            {account.realData && (
              <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 px-2 py-1 rounded-full text-xs">
                <Activity className="w-3 h-3" />
                <span>Live Data</span>
              </div>
            )}
            <button
              onClick={() => copyToClipboard(account.address)}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-0">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: RefreshCw },
            { id: 'send', label: 'Send', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Real Data Status */}
            {account.realData ? (
              <div className={`bg-${blockchainInfo.color === 'blue' ? 'blue' : 'green'}-50 border border-${blockchainInfo.color === 'blue' ? 'blue' : 'green'}-200 rounded-lg p-3`}>
                <div className="flex items-center space-x-2">
                  <Activity className={`w-4 h-4 text-${blockchainInfo.color === 'blue' ? 'blue' : 'green'}-600`} />
                  <span className={`text-sm font-medium text-${blockchainInfo.color === 'blue' ? 'blue' : 'green'}-800`}>
                    Данные получены из Bybit Wallet с ценами в USD
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Не удалось получить данные из Bybit Wallet
                  </span>
                </div>
              </div>
            )}

            {/* Total Portfolio Value */}
            {totalUSDValue > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-sm text-blue-700 mb-1">Общая стоимость портфеля</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${totalUSDValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {Object.keys(account.balance).length} токен{Object.keys(account.balance).length !== 1 ? 'ов' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Network Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Network:</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  account.network === 'mainnet' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {account.network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${blockchainInfo.color}-100 text-${blockchainInfo.color}-700`}>
                  {blockchainInfo.name}
                </span>
              </div>
            </div>

            {/* Token Balances with Prices */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Token Balances</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefreshBalance}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Обновить баланс"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {account.blockchain === 'ton' && (
                    <button
                      onClick={() => setShowCustomTokenForm(!showCustomTokenForm)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Добавить токен"
                    >
                      <Coins className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Форма добавления кастомного токена */}
              {showCustomTokenForm && account.blockchain === 'ton' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">Добавить TON токен</h5>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                      placeholder="Адрес контракта токена"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={handleAddCustomToken}
                      disabled={loading || !customTokenAddress}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Добавить'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Введите адрес Jetton токена в формате EQ... для добавления в кошелек
                  </p>
                </div>
              )}

              {Object.keys(account.balance).length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Кошелек пуст</p>
                  <p className="text-gray-500 text-sm">
                    На этом {blockchainInfo.name} адресе нет токенов
                  </p>
                </div>
              ) : (
                Object.entries(account.balance).map(([token, balance]) => {
                  const price = account.tokenPrices?.[token] || 0;
                  const usdValue = account.tokenValues?.[token] || 0;
                  
                  return (
                    <div key={token} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{token.slice(0, 3)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{token}</div>
                          {account.blockchain === 'ton' && token.startsWith('j') && (
                            <div className="text-xs text-blue-600">Jetton Token</div>
                          )}
                          {price > 0 && (
                            <div className="text-xs text-gray-500">
                              ${price.toFixed(price < 1 ? 6 : 2)} per token
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatBalance(balance)} {token}
                        </div>
                        {usdValue > 0 ? (
                          <div className="text-sm text-green-600 font-medium">
                            ${usdValue.toLocaleString()}
                          </div>
                        ) : balance > 0 && price > 0 ? (
                          <div className="text-sm text-gray-500">
                            ≈ ${(balance * price).toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            $0.00
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('send')}
                disabled={!hasBalance}
                className="flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>

            {/* Bybit Wallet Integration Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Bybit Wallet Integration</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Данные получены напрямую из Bybit Wallet с актуальными ценами токенов в USD. 
                    Отображаются все токены, включая с нулевым балансом.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Recent Transactions</h4>
              <button
                onClick={loadTransactions}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-600">Загрузка транзакций из {blockchainInfo.name}...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Транзакции не найдены</p>
                <p className="text-gray-500 text-sm">
                  На этом {blockchainInfo.name} адресе нет недавних транзакций
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 capitalize">{tx.type}</span>
                          {getStatusBadge(tx.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        tx.type === 'receive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount.toFixed(6)} {tx.token}
                      </div>
                      <button
                        onClick={() => copyToClipboard(tx.hash)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {formatAddress(tx.hash)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'send' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Send Transaction</h4>
            
            {!hasBalance && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Недостаточно средств для отправки транзакций
                  </span>
                </div>
              </div>
            )}

            {account.blockchain === 'ton' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    TON транзакции пока не поддерживаются через Bybit Wallet
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <select
                  value={sendForm.token}
                  onChange={(e) => setSendForm({...sendForm, token: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!hasBalance || account.blockchain === 'ton'}
                >
                  {Object.entries(account.balance)
                    .filter(([, balance]) => balance > 0)
                    .map(([token, balance]) => (
                    <option key={token} value={token}>
                      {token} (Balance: {formatBalance(balance)})
                    </option>
                  ))}
                  {!hasBalance && (
                    <option value="">No tokens available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={sendForm.to}
                  onChange={(e) => setSendForm({...sendForm, to: e.target.value})}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!hasBalance || account.blockchain === 'ton'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
                    placeholder="0.0"
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={!hasBalance || account.blockchain === 'ton'}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {sendForm.token}
                  </span>
                </div>
                {hasBalance && account.balance[sendForm.token] && (
                  <div className="mt-1 text-sm text-gray-500">
                    Available: {formatBalance(account.balance[sendForm.token])} {sendForm.token}
                  </div>
                )}
              </div>

              <button
                onClick={handleSendTransaction}
                disabled={loading || !sendForm.to || !sendForm.amount || !hasBalance || account.blockchain === 'ton'}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send Transaction'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BybitWalletConnect;