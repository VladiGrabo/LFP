import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, TrendingUp, TrendingDown, Target, Wallet, Brain, Home, Calculator, Percent } from 'lucide-react';
import GoalsSection from './GoalsSection';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';
import AssetsSection from './AssetsSection';
import AIAnalysis from './AIAnalysis';
import Onboarding from './Onboarding';
import DownloadReport from './DownloadReport';
import FinancialPlan from './FinancialPlan';
import CompoundInterestCalculator from './CompoundInterestCalculator';
import CurrencySelector from './CurrencySelector';
import { useCurrency } from '../hooks/useCurrency';
import { formatAmount } from '../lib/currency';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalAssets: 0,
    goalsCount: 0,
  });
  const [goals, setGoals] = useState<any[]>([]);
  const { currency } = useCurrency(user.id);

  useEffect(() => {
    loadStats();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadStats();
  };

  const loadStats = async () => {
    const [incomeData, expensesData, assetsData, goalsData] = await Promise.all([
      supabase.from('income').select('amount').eq('user_id', user.id),
      supabase.from('expenses').select('amount').eq('user_id', user.id),
      supabase.from('assets').select('value').eq('user_id', user.id),
      supabase.from('financial_goals').select('*').eq('user_id', user.id),
    ]);

    setStats({
      totalIncome: incomeData.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0,
      totalExpenses: expensesData.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0,
      totalAssets: assetsData.data?.reduce((sum, item) => sum + Number(item.value), 0) || 0,
      goalsCount: goalsData.data?.length || 0,
    });
    setGoals(goalsData.data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const netWorth = stats.totalAssets + (stats.totalIncome - stats.totalExpenses);

  return (
    <div className="min-h-screen bg-slate-50">
      {showOnboarding && <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">FinancePlan</h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CurrencySelector userId={user.id} onCurrencyChange={loadStats} />
              <DownloadReport userId={user.id} stats={stats} netWorth={netWorth} />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline text-sm">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-green-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 text-xs sm:text-sm font-semibold uppercase tracking-wide">Income</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-900 truncate">
              {formatAmount(stats.totalIncome, currency)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-red-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-700 text-xs sm:text-sm font-semibold uppercase tracking-wide">Expenses</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <TrendingDown size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-red-900 truncate">
              {formatAmount(stats.totalExpenses, currency)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700 text-xs sm:text-sm font-semibold uppercase tracking-wide">Assets</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <Wallet size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-900 truncate">
              {formatAmount(stats.totalAssets, currency)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-purple-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-700 text-xs sm:text-sm font-semibold uppercase tracking-wide">Goals</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <Target size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-purple-900">{stats.goalsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 mb-6 sm:mb-8">
          {/* Mobile Navigation - Dropdown */}
          <div className="border-b border-slate-200 p-3 md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 text-base font-medium text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'goals', label: 'Goals', icon: '🎯' },
                { id: 'income', label: 'Income', icon: '📈' },
                { id: 'expenses', label: 'Expenses', icon: '📉' },
                { id: 'assets', label: 'Assets', icon: '💼' },
                { id: 'financial-plan', label: 'Financial Plan', icon: '🧮' },
                { id: 'compound-interest', label: 'Return Calculator', icon: '📊' },
                { id: 'analysis', label: 'Recommendations', icon: '🧠' },
              ].map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Navigation - Tabs */}
          <div className="border-b border-slate-200 hidden md:block">
            <nav className="flex gap-1 p-2">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'income', label: 'Income', icon: TrendingUp },
                { id: 'expenses', label: 'Expenses', icon: TrendingDown },
                { id: 'assets', label: 'Assets', icon: Wallet },
                { id: 'financial-plan', label: 'Financial Plan', icon: Calculator },
                { id: 'compound-interest', label: 'Return Calculator', icon: Percent },
                { id: 'analysis', label: 'Recommendations', icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Financial Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-emerald-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Чистый capital</h3>
                    <p className="text-2xl sm:text-4xl font-bold text-emerald-700 truncate">{formatAmount(netWorth, currency)}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">Assets минус обязательства</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Чистый income</h3>
                    <p className="text-2xl sm:text-4xl font-bold text-blue-700 truncate">{formatAmount(stats.totalIncome - stats.totalExpenses, currency)}</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">Income минус expenseы</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Quick Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Норма savingsий</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">
                        {stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Surplus</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                        {formatAmount(stats.totalIncome - stats.totalExpenses, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Сбережения per month</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-700 truncate">
                        {formatAmount(Math.max(0, stats.totalIncome - stats.totalExpenses), currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Сбережения per year</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-700 truncate">
                        {formatAmount(Math.max(0, stats.totalIncome - stats.totalExpenses) * 12, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Active Goals</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.goalsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Всего assetов</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{formatAmount(stats.totalAssets, currency)}</p>
                    </div>
                  </div>
                </div>

                {goals.length > 0 && (
                  <div className="mt-4 sm:mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-emerald-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Target size={20} />
                      Goal Progress
                    </h3>
                    <div className="space-y-3">
{goals.map((goal) => {
                        const remaining = Number(goal.target_amount) - Number(goal.current_amount);
                        const monthlySavings = stats.totalIncome - stats.totalExpenses;
                        const monthsNeeded = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : -1;
                        const deadline = new Date(goal.deadline);
                        const today = new Date();
                        const monthsUntilDeadline = Math.max(0, (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth()));
                        const achievable = monthsNeeded > 0 && monthsNeeded <= monthsUntilDeadline;
                        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;

                        const additionalIncomeNeeded = monthsUntilDeadline > 0 && remaining > 0
                          ? Math.max(0, (remaining / monthsUntilDeadline) - monthlySavings)
                          : 0;

                        const formatMonths = (months: number) => {
                          if (months < 12) {
                            return `${months} mo.`;
                          }
                          const years = Math.floor(months / 12);
                          const remainingMonths = months % 12;
                          const yearWord = years === 1 ? 'year' : years < 5 ? 'years' : 'years';
                          if (remainingMonths === 0) {
                            return `${years} ${yearWord}`;
                          }
                          return `${years} ${yearWord} ${remainingMonths} mo.`;
                        };

                        return (
                          <div key={goal.id} className={`bg-white rounded-lg p-3 sm:p-4 border-2 ${achievable ? 'border-green-300' : 'border-orange-300'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-sm sm:text-base text-slate-900">{goal.title}</h4>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${achievable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {achievable ? '✓ Achievable' : '⚠ Attention'}
                              </span>
                            </div>
                            <div className="mb-2">
                              <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-1">
                                <span>{formatAmount(Number(goal.current_amount), currency)} / {formatAmount(Number(goal.target_amount), currency)}</span>
                                <span>{progress.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${achievable ? 'bg-green-500' : 'bg-orange-500'}`}
                                  style={{ width: `${Math.min(100, progress)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
                              <div>
                                <span className="text-slate-600">Remaining:</span>
                                <span className="ml-1 font-semibold text-slate-900">{formatAmount(remaining, currency)}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Current Timeframe:</span>
                                <span className="ml-1 font-semibold text-slate-900">
                                  {monthsNeeded === -1 ? 'Unachievable' : formatMonths(monthsNeeded)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Дедлайн:</span>
                                <span className="ml-1 font-semibold text-slate-900">{deadline.toLocaleDateString('en-GB')}</span>
                              </div>
                            </div>

                            {!achievable && additionalIncomeNeeded > 0 && (
                              <div className="mt-2 pt-2 border-t border-orange-200 bg-orange-50 px-3 py-2 rounded -mx-3 sm:-mx-4">
                                <p className="text-xs font-semibold text-orange-900 mb-1">
                                  To achieve the goal by the deadline:
                                </p>
                                <p className="text-xs text-orange-700">
                                  Additional income needed: <span className="font-bold">{formatAmount(additionalIncomeNeeded, currency)}/mo.</span>
                                </p>
                              </div>
                            )}

                            {monthlySavings <= 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-xs text-red-700">
                                  Increase income or reduce expenses to achieve the goal
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'goals' && <GoalsSection userId={user.id} currency={currency} onUpdate={loadStats} />}
            {activeTab === 'income' && <IncomeSection userId={user.id} currency={currency} onUpdate={loadStats} />}
            {activeTab === 'expenses' && <ExpensesSection userId={user.id} currency={currency} onUpdate={loadStats} />}
            {activeTab === 'assets' && <AssetsSection userId={user.id} currency={currency} onUpdate={loadStats} />}
            {activeTab === 'financial-plan' && <FinancialPlan />}
            {activeTab === 'compound-interest' && <CompoundInterestCalculator currency={currency} />}
            {activeTab === 'analysis' && <AIAnalysis userId={user.id} stats={stats} netWorth={netWorth} goals={goals} currency={currency} />}
          </div>
        </div>
      </main>
    </div>
  );
}
