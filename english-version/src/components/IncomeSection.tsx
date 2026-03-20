import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, TrendingUp, Trash2, Info } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { getCurrencySymbol } from '../lib/currency';

type Income = Database['public']['Tables']['income']['Row'];

interface IncomeSectionProps {
  userId: string;
  currency: string;
  onUpdate: () => void;
}

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other'];

export default function IncomeSection({ userId, currency, onUpdate }: IncomeSectionProps) {
  const [income, setIncome] = useState<Income[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    category: INCOME_CATEGORIES[0],
    description: '',
  });

  useEffect(() => {
    loadIncome();
  }, [userId]);

  const loadIncome = async () => {
    const { data } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (data) setIncome(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const source = formData.category === 'Other' ? formData.source : formData.category;

    const { error } = await supabase.from('income').insert({
      user_id: userId,
      source: source,
      amount: Number(formData.amount),
      category: formData.category,
      date: new Date().toISOString().split('T')[0],
      description: formData.description,
      is_recurring: false,
    });

    if (!error) {
      setFormData({
        source: '',
        amount: '',
        category: INCOME_CATEGORIES[0],
        description: '',
      });
      setShowForm(false);
      loadIncome();
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('income').delete().eq('id', id);
    loadIncome();
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Income</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">Add Income</span>
          <span className="xs:hidden">Income</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-3">
          <Info size={18} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">Why is it important to record all income?</p>
            <p className="text-xs sm:text-sm text-blue-800">
              Accurate tracking of all income sources helps our system create a personalized financial plan, calculate real opportunities for achieving goals, and determine the optimal savings strategy. The more complete the data, the more accurate the recommendations.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {formData.category === 'Other' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Income Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="For example: Main job"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Additional information..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition-all shadow-md"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 sm:space-y-3">
        {income.map((item) => (
          <div key={item.id} className="bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all hover:border-green-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate">{item.source}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 flex-wrap">
                    <span className="truncate">{item.category}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <span className="text-base sm:text-lg font-bold text-green-600 whitespace-nowrap">
                  +{getCurrencySymbol(currency)}{Number(item.amount).toLocaleString('en-GB')}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {income.length === 0 && !showForm && (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <TrendingUp size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg font-medium">No income records yet</p>
          <p className="text-sm text-slate-500 mt-2">Add your first record to start tracking</p>
        </div>
      )}
    </div>
  );
}
