import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Minus,
  History,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Building,
  Smartphone,
  Globe,
  Lock,
  Zap,
  TrendingUp,
  Wallet as WalletIcon,
  X,
  Check,
  Filter,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useWalletIntegration } from '../hooks/useWalletIntegration';
import { useBybitWallet } from '../hooks/useBybitWallet';
import WalletConnectionModal from './WalletConnectionModal';
import DepositModal from './DepositModal';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
  method: string;
  fee?: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  name: string;
  details: string;
  isDefault: boolean;
  verified: boolean;
}

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw' | 'history'>('balance');
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Используем интеграцию кошельков
  const { 
    totalBalance, 
    connectedWallets, 
    hasConnectedWallets, 
    walletStats,
    connectBybitWallet,
    disconnectWallet,
    loading: walletLoading
  } = useWalletIntegration();

  const { account: bybitAccount } = useBybitWallet();

  // История транзакций - только депозиты и выводы
  const transactions: Transaction[] = [
    {
      id: 'DEP-001',
      type: 'deposit',
      amount: 10000,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Bank transfer deposit',
      method: 'Bank Transfer',
      fee: 0
    },
    {
      id: 'WTH-001',
      type: 'withdrawal',
      amount: 2500,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      description: 'Withdrawal to bank account',
      method: 'Bank Transfer',
      fee: 0
    },
    {
      id: 'DEP-002',
      type: 'deposit',
      amount: 5000,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      description: 'Card deposit',
      method: 'Visa ****1234',
      fee: 145 // 2.9% fee
    },
    {
      id: 'WTH-002',
      type: 'withdrawal',
      amount: 1000,
      currency: 'USD',
      status: 'pending',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      description: 'Withdrawal to card',
      method: 'Visa ****1234',
      fee: 15 // 1.5% fee
    },
    {
      id: 'DEP-003',
      type: 'deposit',
      amount: 15000,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      description: 'Wire transfer deposit',
      method: 'Wire Transfer',
      fee: 25
    },
    {
      id: 'WTH-003',
      type: 'withdrawal',
      amount: 3000,
      currency: 'USD',
      status: 'failed',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      description: 'Withdrawal failed - insufficient verification',
      method: 'Bank Transfer',
      fee: 0
    },
    {
      id: 'DEP-004',
      type: 'deposit',
      amount: 0.5,
      currency: 'BTC',
      status: 'completed',
      timestamp: new Date(Date.now() - 518400000).toISOString(),
      description: 'Bitcoin deposit',
      method: 'BTC Wallet',
      fee: 0.0001 // Network fee
    }
  ];

  // Методы вывода
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      type: 'card',
      name: 'Visa ****1234',
      details: 'Expires 12/26',
      isDefault: true,
      verified: true
    },
    {
      id: 'card-2',
      type: 'card',
      name: 'Mastercard ****5678',
      details: 'Expires 08/25',
      isDefault: false,
      verified: true
    },
    {
      id: 'bank-1',
      type: 'bank',
      name: 'Sberbank',
      details: 'Account ****7890',
      isDefault: false,
      verified: true
    },
    {
      id: 'crypto-1',
      type: 'crypto',
      name: 'Bitcoin Wallet',
      details: 'bc1q...xyz123',
      isDefault: false,
      verified: true
    }
  ];

  const handleWithdraw = () => {
    if (!withdrawAmount || !selectedMethod) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > totalBalance.available) {
      alert('Некорректная сумма для вывода');
      return;
    }

    console.log('Withdrawal request:', {
      amount,
      method: selectedMethod,
      timestamp: new Date().toISOString()
    });

    alert(`Заявка на вывод $${amount} создана успешно!`);
    setWithdrawAmount('');
    setSelectedMethod('');
    setActiveTab('history');
  };

  const handleWalletConnect = async (walletData: any) => {
    try {
      await connectBybitWallet(walletData);
      setShowWalletModal(false);
      alert('Кошелек успешно подключен!');
    } catch (error: any) {
      alert(`Ошибка подключения: ${error.message}`);
    }
  };

  const handleDeposit = (amount: number, method: string) => {
    console.log('Deposit request:', { amount, method, timestamp: new Date().toISOString() });
    alert(`Заявка на пополнение $${amount} через ${method} создана успешно!`);
    setActiveTab('history');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер обмена');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'bank':
        return <Building className="w-5 h-5 text-green-600" />;
      case 'crypto':
        return <Globe className="w-5 h-5 text-orange-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  // Фильтрация транзакций
  const filteredTransactions = transactions.filter(transaction => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'deposits') return transaction.type === 'deposit';
    if (historyFilter === 'withdrawals') return transaction.type === 'withdrawal';
    return true;
  });

  const tabs = [
    { id: 'balance', label: 'Balance', icon: WalletIcon },
    { id: 'deposit', label: 'Deposit', icon: Plus },
    { id: 'withdraw', label: 'Withdraw', icon: Minus },
    { id: 'history', label: 'History', icon: History }
  ];

  const renderBalanceTab = () => (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Balance</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            {hasConnectedWallets && (
              <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 px-2 py-1 rounded-full text-xs">
                <Check className="w-3 h-3" />
                <span>Live</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {showBalance ? `$${totalBalance.total.toLocaleString()}` : '****'}
          </div>
          <div className="text-blue-100 text-sm">
            Available: {showBalance ? `$${totalBalance.available.toLocaleString()}` : '****'}
          </div>
          {hasConnectedWallets && (
            <div className="text-blue-100 text-xs">
              {connectedWallets.length} wallet{connectedWallets.length !== 1 ? 's' : ''} connected
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Connected Wallets Status */}
      {hasConnectedWallets ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Connected Wallets</h3>
            <button
              onClick={() => setShowWalletModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Manage
            </button>
          </div>
          
          <div className="space-y-3">
            {connectedWallets.map((wallet, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{wallet.type} Wallet</div>
                    <div className="text-sm text-gray-600">{wallet.address}</div>
                    {wallet.blockchain && (
                      <div className="text-xs text-blue-600 capitalize">{wallet.blockchain} Network</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${wallet.balance.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Connected</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Crypto Wallet</h3>
            <p className="text-gray-600 mb-4">
              Connect your crypto wallet to see real-time balances and manage your funds directly
            </p>
            <button
              onClick={() => setShowWalletModal(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Connect Wallet
            </button>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Мультисеть поддержка</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Безопасное подключение</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Реальные данные</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ${totalBalance.available.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">Ready to trade</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Locked</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ${totalBalance.locked.toLocaleString()}
          </div>
          <div className="text-sm text-orange-600">In open positions</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Portfolio Growth</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            +{((totalBalance.total / 100000) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-green-600">All time</div>
        </div>
      </div>

      {/* Token Breakdown */}
      {hasConnectedWallets && Object.keys(totalBalance.breakdown).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Holdings</h3>
          <div className="space-y-3">
            {Object.entries(totalBalance.breakdown)
              .sort(([,a], [,b]) => b.usdValue - a.usdValue)
              .map(([token, data]) => (
              <div key={token} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{token}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{token}</div>
                    <div className="text-sm text-gray-600">{data.amount.toFixed(6)} {token}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${data.usdValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((data.usdValue / totalBalance.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Funds</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Minus className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Withdraw</span>
          </button>

          <button 
            onClick={() => setShowWalletModal(true)}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Connect Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">History</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDepositTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Your Account</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Transfer */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                <p className="text-sm text-gray-600">Free • 1-3 business days</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Transfer funds directly from your bank account. No fees, secure processing.
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Add Bank Account
            </button>
          </div>

          {/* Debit Card */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Debit Card</h4>
                <p className="text-sm text-gray-600">2.9% fee • Instant</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add funds instantly using your debit card. Small fee applies.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Card
            </button>
          </div>

          {/* Crypto Deposit */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Cryptocurrency</h4>
                <p className="text-sm text-gray-600">Network fees • 10-60 minutes</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Deposit Bitcoin, Ethereum, or other cryptocurrencies.
            </p>
            <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Get Address
            </button>
          </div>

          {/* Crypto Wallet */}
          <div className="border border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer bg-orange-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Crypto Wallet</h4>
                <p className="text-sm text-gray-600">Instant • No fees</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Connect your crypto wallet for instant deposits and real-time balance sync.
            </p>
            <button 
              onClick={() => setShowWalletModal(true)}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              {hasConnectedWallets ? 'Manage Wallets' : 'Connect Wallet'}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Secure Deposits</h4>
              <p className="text-sm text-blue-700 mt-1">
                All deposits are protected by bank-level security and insurance. 
                Your funds are segregated and held in secure accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWithdrawTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
        
        <div className="space-y-6">
          {/* Available Balance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available for withdrawal:</span>
              <span className="text-xl font-bold text-gray-900">
                ${totalBalance.available.toLocaleString()}
              </span>
            </div>
            {hasConnectedWallets && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Real-time balance from connected wallets
              </div>
            )}
          </div>

          {/* Withdrawal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">Minimum: $10</span>
              <button
                onClick={() => setWithdrawAmount(totalBalance.available.toString())}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Max: ${totalBalance.available.toLocaleString()}
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Withdrawal Method
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMethodIcon(method.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{method.name}</span>
                          {method.isDefault && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              Default
                            </span>
                          )}
                          {method.verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Method */}
              <button
                onClick={() => setShowAddMethod(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add New Payment Method</span>
                </div>
              </button>
            </div>
          </div>

          {/* Processing Time */}
          {selectedMethod && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Processing Time</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {selectedMethod.includes('card') && 'Card withdrawals typically take 1-3 business days to process.'}
                    {selectedMethod.includes('bank') && 'Bank transfers typically take 1-5 business days to process.'}
                    {selectedMethod.includes('crypto') && 'Crypto withdrawals typically take 10-60 minutes to process.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || !selectedMethod}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Withdraw ${withdrawAmount || '0.00'}
          </button>

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Security & Fees</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• All withdrawals are reviewed for security</li>
                  <li>• Bank transfers: Free</li>
                  <li>• Card withdrawals: 1.5% fee</li>
                  <li>• Crypto withdrawals: Network fees apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-2">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  historyFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setHistoryFilter('deposits')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  historyFilter === 'deposits'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setHistoryFilter('withdrawals')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  historyFilter === 'withdrawals'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Withdrawals
              </button>
            </div>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No transactions found</p>
            <p className="text-gray-500 text-sm">
              {historyFilter === 'all' 
                ? 'Your transaction history will appear here'
                : `No ${historyFilter} found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {transaction.type}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{new Date(transaction.timestamp).toLocaleString('ru-RU')}</span>
                      <span>•</span>
                      <span>{transaction.method}</span>
                    </div>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-lg ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.currency === 'USD' ? '$' : ''}
                    {transaction.amount.toLocaleString()}
                    {transaction.currency !== 'USD' ? ` ${transaction.currency}` : ''}
                  </div>
                  {transaction.fee && transaction.fee > 0 && (
                    <div className="text-sm text-gray-500">
                      Fee: {transaction.currency === 'USD' ? '$' : ''}{transaction.fee}
                      {transaction.currency !== 'USD' ? ` ${transaction.currency}` : ''}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">
                    ID: {transaction.id}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(transaction.id)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-2"
                  title="Copy transaction ID"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-700 mb-1">Total Deposits</div>
                <div className="text-xl font-bold text-green-900">
                  ${transactions
                    .filter(t => t.type === 'deposit' && t.status === 'completed' && t.currency === 'USD')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-700 mb-1">Total Withdrawals</div>
                <div className="text-xl font-bold text-red-900">
                  ${transactions
                    .filter(t => t.type === 'withdrawal' && t.status === 'completed' && t.currency === 'USD')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">Net Flow</div>
                <div className="text-xl font-bold text-blue-900">
                  ${(transactions
                    .filter(t => t.status === 'completed' && t.currency === 'USD')
                    .reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Wallet & Withdrawals</h2>
        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
          <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          <span>
            {hasConnectedWallets ? 'Live wallet data' : 'Secure banking & instant withdrawals'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'balance' && renderBalanceTab()}
          {activeTab === 'deposit' && renderDepositTab()}
          {activeTab === 'withdraw' && renderWithdrawTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment Method</h3>
              <button
                onClick={() => setShowAddMethod(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900">Add Debit/Credit Card</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Building className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">Add Bank Account</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Globe className="w-5 h-5 text-orange-600" />
                <span className="text-gray-900">Add Crypto Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />
    </div>
  );
};

export default Wallet;