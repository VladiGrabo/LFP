import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  Key, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Lock,
  Unlock,
  Activity,
  DollarSign,
  TrendingUp,
  BarChart3,
  Wallet,
  ExternalLink,
  Plus,
  Zap
} from 'lucide-react';
import WalletConnectionModal from './WalletConnectionModal';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'trading' | 'wallets'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Пользовательские данные
  const [userData, setUserData] = useState({
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 (999) 123-45-67',
    country: 'Россия',
    city: 'Москва',
    dateOfBirth: '1990-05-15',
    joinDate: '2023-01-15',
    verificationLevel: 'Verified',
    accountType: 'Premium'
  });

  // Торговые настройки
  const [tradingSettings, setTradingSettings] = useState({
    defaultLeverage: '10',
    riskLevel: 'medium',
    autoStopLoss: true,
    defaultOrderType: 'market',
    confirmTrades: true,
    showPnLInPercent: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'trading', label: 'Trading Settings', icon: BarChart3 },
    { id: 'wallets', label: 'Crypto Wallets', icon: Wallet }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Здесь бы был API вызов для сохранения данных
    console.log('Profile saved:', userData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Восстанавливаем исходные данные
  };

  const handleWalletConnect = async (walletData: any) => {
    try {
      console.log('Wallet connected:', walletData);
      setShowWalletModal(false);
      alert('Кошелек успешно подключен!');
    } catch (error: any) {
      alert(`Ошибка подключения: ${error.message}`);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{userData.firstName} {userData.lastName}</h2>
            <p className="text-blue-100">{userData.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="flex items-center space-x-1 bg-green-500 bg-opacity-20 px-2 py-1 rounded-full text-sm">
                <Check className="w-3 h-3" />
                <span>{userData.verificationLevel}</span>
              </span>
              <span className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full text-sm">
                <TrendingUp className="w-3 h-3" />
                <span>{userData.accountType}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{userData.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{userData.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userData.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userData.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <select
                  value={userData.country}
                  onChange={(e) => setUserData({...userData, country: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Россия">Россия</option>
                  <option value="США">США</option>
                  <option value="Германия">Германия</option>
                  <option value="Великобритания">Великобритания</option>
                </select>
              ) : (
                <p className="text-gray-900">{userData.country}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="date"
                  value={userData.dateOfBirth}
                  onChange={(e) => setUserData({...userData, dateOfBirth: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{new Date(userData.dateOfBirth).toLocaleDateString('ru-RU')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Account Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Member Since</span>
              </div>
              <p className="text-blue-900 font-medium">{new Date(userData.joinDate).toLocaleDateString('ru-RU')}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Total Trades</span>
              </div>
              <p className="text-green-900 font-medium">247</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">Success Rate</span>
              </div>
              <p className="text-purple-900 font-medium">68.5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              {twoFactorEnabled ? <Lock className="w-5 h-5 text-green-600" /> : <Unlock className="w-5 h-5 text-gray-600" />}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              twoFactorEnabled 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">2FA Enabled</h4>
                <p className="text-sm text-green-700">Your account is protected with two-factor authentication.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600">Chrome on Windows • Moscow, Russia</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Mobile App</p>
                <p className="text-sm text-gray-600">iPhone • 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm">Terminate</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive trade confirmations and account updates</p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Get instant alerts on your device</p>
              </div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
              <div>
                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderTradingTab = () => (
    <div className="space-y-6">
      {/* Default Trading Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Trading Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Leverage</label>
            <select
              value={tradingSettings.defaultLeverage}
              onChange={(e) => setTradingSettings({...tradingSettings, defaultLeverage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
              <option value="20">20x</option>
              <option value="50">50x</option>
              <option value="100">100x</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
            <select
              value={tradingSettings.riskLevel}
              onChange={(e) => setTradingSettings({...tradingSettings, riskLevel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Order Type</label>
            <select
              value={tradingSettings.defaultOrderType}
              onChange={(e) => setTradingSettings({...tradingSettings, defaultOrderType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trading Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Stop-Loss</h4>
              <p className="text-sm text-gray-600">Automatically set stop-loss orders</p>
            </div>
            <button
              onClick={() => setTradingSettings({...tradingSettings, autoStopLoss: !tradingSettings.autoStopLoss})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tradingSettings.autoStopLoss ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tradingSettings.autoStopLoss ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Confirm Trades</h4>
              <p className="text-sm text-gray-600">Show confirmation dialog before executing trades</p>
            </div>
            <button
              onClick={() => setTradingSettings({...tradingSettings, confirmTrades: !tradingSettings.confirmTrades})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tradingSettings.confirmTrades ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tradingSettings.confirmTrades ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show P&L in Percentage</h4>
              <p className="text-sm text-gray-600">Display profit/loss as percentage instead of absolute values</p>
            </div>
            <button
              onClick={() => setTradingSettings({...tradingSettings, showPnLInPercent: !tradingSettings.showPnLInPercent})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tradingSettings.showPnLInPercent ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tradingSettings.showPnLInPercent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management</h3>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Risk Warning</h4>
              <p className="text-sm text-orange-700 mt-1">
                Trading with leverage involves significant risk. Never invest more than you can afford to lose.
                Consider your experience level and risk tolerance before trading.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">High Risk</span>
            </div>
            <p className="text-xs text-red-700">Leverage above 20x</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">Medium Risk</span>
            </div>
            <p className="text-xs text-yellow-700">Leverage 5x - 20x</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Low Risk</span>
            </div>
            <p className="text-xs text-green-700">Leverage below 5x</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWalletsTab = () => (
    <div className="space-y-6">
      {/* Connected Wallets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Connected Wallets</h3>
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        </div>

        {/* Wallet Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bybit Wallet */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Bybit Wallet</h4>
                <p className="text-sm text-gray-600">Web3 Browser Extension</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Connect your Bybit Wallet directly through browser extension for secure transactions.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Connect
              </button>
              <a
                href="https://www.bybit.com/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Trust Wallet */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Trust Wallet</h4>
                <p className="text-sm text-gray-600">Mobile & Desktop Wallet</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Connect your Trust Wallet for secure DeFi transactions and token management.
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowWalletModal(true)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Connect
              </button>
              <a
                href="https://trustwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* MetaMask */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">MetaMask</h4>
                <p className="text-sm text-gray-600">Browser Extension</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Connect MetaMask for Ethereum and EVM-compatible blockchain interactions.
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowWalletModal(true)}
                className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Connect
              </button>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* WalletConnect */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">WalletConnect</h4>
                <p className="text-sm text-gray-600">Universal Protocol</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Connect any WalletConnect-compatible wallet through QR code scanning.
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowWalletModal(true)}
                className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Connect
              </button>
              <a
                href="https://walletconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Wallet Security</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your wallet connections are secured through industry-standard Web3 protocols. 
                We never store your private keys or seed phrases. Always verify transaction details before confirming.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Features */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">Secure Transactions</h4>
              <p className="text-xs md:text-sm text-gray-600">All transactions are signed locally in your wallet</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">Instant Trading</h4>
              <p className="text-xs md:text-sm text-gray-600">Execute trades directly from your connected wallet</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <Globe className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">Multi-Chain</h4>
              <p className="text-xs md:text-sm text-gray-600">Support for multiple blockchain networks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Profile Settings</h2>
        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
          <User className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          <span>Manage your account and preferences</span>
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
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'trading' && renderTradingTab()}
          {activeTab === 'wallets' && renderWalletsTab()}
        </div>
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
};

export default Profile;