import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Wallet, Trash2, Info } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { getCurrencySymbol } from '../lib/currency';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetsSectionProps {
  userId: string;
  currency: string;
  onUpdate: () => void;
}

const ASSET_TYPES = ['Real Estate', 'Vehicle', 'Investments', 'Savings', 'Cryptocurrency', 'Securities', 'Other'];

export default function AssetsSection({ userId, currency, onUpdate }: AssetsSectionProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: ASSET_TYPES[0],
    value: '',
    description: '',
  });

  useEffect(() => {
    loadAssets();
  }, [userId]);

  const loadAssets = async () => {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setAssets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('assets').insert({
      user_id: userId,
      name: formData.name,
      type: formData.type,
      value: Number(formData.value),
      description: formData.description,
      purchase_date: null,
    });

    if (!error) {
      setFormData({
        name: '',
        type: ASSET_TYPES[0],
        value: '',
        description: '',
      });
      setShowForm(false);
      loadAssets();
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('assets').delete().eq('id', id);
    loadAssets();
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Assets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">Add Asset</span>
          <span className="xs:hidden">Asset</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-3">
          <Info size={18} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">Why is it important to record all assets?</p>
            <p className="text-xs sm:text-sm text-blue-800">
              Complete asset tracking helps our system evaluate your net worth, determine investment potential, and create a long-term capital growth strategy. Understanding all your resources is critical for smart financial planning.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asset Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="For example: Downtown apartment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asset Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Value ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={2}
                placeholder="Additional asset information..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all shadow-md"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all hover:border-blue-300">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Wallet size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{asset.name}</h3>
                  <span className="text-xs sm:text-sm text-slate-600 truncate block">{asset.type}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(asset.id)}
                className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <Trash2 size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-blue-700 truncate block">
                {getCurrencySymbol(currency)}{Number(asset.value).toLocaleString('en-GB')}
              </span>
            </div>

            {asset.description && (
              <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">{asset.description}</p>
            )}
          </div>
        ))}
      </div>

      {assets.length === 0 && !showForm && (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <Wallet size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg font-medium">No asset records yet</p>
          <p className="text-sm text-slate-500 mt-2">Add your first asset to start tracking</p>
        </div>
      )}
    </div>
  );
}
