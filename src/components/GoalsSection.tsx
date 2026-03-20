import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Target, Calendar, Trash2, Clock, TrendingUp, Info } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { getCurrencySymbol } from '../lib/currency';

type Goal = Database['public']['Tables']['financial_goals']['Row'];

interface GoalsSectionProps {
  userId: string;
  currency: string;
  onUpdate: () => void;
}

export default function GoalsSection({ userId, currency, onUpdate }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    timeframe: '',
    timeframeUnit: 'months' as 'months' | 'years',
  });

  useEffect(() => {
    loadGoals();
    loadFinancials();
  }, [userId]);

  const loadGoals = async () => {
    const { data } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });
    if (data) setGoals(data);
  };

  const loadFinancials = async () => {
    const [incomeData, expensesData] = await Promise.all([
      supabase.from('income').select('amount').eq('user_id', userId),
      supabase.from('expenses').select('amount').eq('user_id', userId),
    ]);

    const income = incomeData.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const expenses = expensesData.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    setMonthlyIncome(income);
    setMonthlyExpenses(expenses);
  };

  const calculateTimeToGoal = (goal: Goal) => {
    const remaining = goal.target_amount - goal.current_amount;
    const monthlySavings = monthlyIncome - monthlyExpenses;

    if (monthlySavings <= 0 || remaining <= 0) {
      return null;
    }

    const monthsNeeded = Math.ceil(remaining / monthlySavings);

    if (monthsNeeded < 1) return 'Меньше 1 месяца';
    if (monthsNeeded === 1) return '1 месяц';
    if (monthsNeeded < 12) return `${monthsNeeded} ${monthsNeeded < 5 ? 'месяца' : 'месяцев'}`;

    const years = Math.floor(monthsNeeded / 12);
    const months = monthsNeeded % 12;

    if (months === 0) {
      return years === 1 ? '1 год' : `${years} ${years < 5 ? 'года' : 'лет'}`;
    }

    const yearText = years === 1 ? 'год' : years < 5 ? 'года' : 'лет';
    const monthText = months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев';
    return `${years} ${yearText} ${months} ${monthText}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate deadline from timeframe
    const deadline = new Date();
    const timeframeValue = Number(formData.timeframe);
    if (formData.timeframeUnit === 'months') {
      deadline.setMonth(deadline.getMonth() + timeframeValue);
    } else {
      deadline.setFullYear(deadline.getFullYear() + timeframeValue);
    }

    const { error } = await supabase.from('financial_goals').insert({
      user_id: userId,
      title: formData.title,
      description: formData.description,
      target_amount: Number(formData.target_amount),
      current_amount: Number(formData.current_amount) || 0,
      deadline: deadline.toISOString().split('T')[0],
    });

    if (!error) {
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        timeframe: '',
        timeframeUnit: 'months',
      });
      setShowForm(false);
      loadGoals();
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('financial_goals').delete().eq('id', id);
    loadGoals();
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Финансовые цели</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">Добавить цель</span>
          <span className="xs:hidden">Цель</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-3">
          <Info size={18} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">Почему важно указывать финансовые цели?</p>
            <p className="text-xs sm:text-sm text-blue-800">
              Четкие финансовые цели помогают нашей системе разработать персональный план действий, рассчитать необходимые суммы накоплений и предложить оптимальные сроки достижения. Без целей невозможно построить эффективную финансовую стратегию и отслеживать прогресс.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Название цели
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Например: Купить автомобиль"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={2}
                placeholder="Дополнительные детали..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Целевая сумма (£)
              </label>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Текущая сумма (£)
              </label>
              <input
                type="number"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Срок достижения цели
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Например: 6"
                />
                <select
                  value={formData.timeframeUnit}
                  onChange={(e) => setFormData({ ...formData, timeframeUnit: e.target.value as 'months' | 'years' })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="months">Месяцев</option>
                  <option value="years">Лет</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg transition-all shadow-md"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const timeToGoal = calculateTimeToGoal(goal);
          const remaining = goal.target_amount - goal.current_amount;

          return (
            <div key={goal.id} className="bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all hover:border-emerald-300">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Target size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-slate-600 truncate">{goal.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-slate-600 font-medium">Прогресс</span>
                  <span className="font-bold text-slate-900">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 sm:h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 sm:h-3 rounded-full transition-all shadow-sm"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3">
                  <span className="text-xs text-slate-600 block mb-1">Текущая</span>
                  <span className="font-bold text-slate-900 text-base sm:text-lg truncate block">
                    £{goal.current_amount.toLocaleString('en-GB')}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3">
                  <span className="text-xs text-slate-600 block mb-1">Цель</span>
                  <span className="font-bold text-slate-900 text-base sm:text-lg truncate block">
                    £{goal.target_amount.toLocaleString('en-GB')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar size={14} className="sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-600 truncate">
                    До <span className="font-medium text-slate-900">{new Date(goal.deadline).toLocaleDateString('ru-RU')}</span>
                  </span>
                </div>

                {timeToGoal && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm bg-emerald-50 rounded-lg p-2 sm:p-2.5 border border-emerald-200">
                    <Clock size={14} className="sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-700 font-medium truncate">
                      Время до цели: {timeToGoal}
                    </span>
                  </div>
                )}

                {remaining > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm bg-blue-50 rounded-lg p-2 sm:p-2.5 border border-blue-200">
                    <TrendingUp size={14} className="sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 font-medium truncate">
                      Осталось £{remaining.toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <Target size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg font-medium">Пока нет финансовых целей</p>
          <p className="text-sm text-slate-500 mt-2">Добавьте первую цель, чтобы начать планирование</p>
        </div>
      )}
    </div>
  );
}
