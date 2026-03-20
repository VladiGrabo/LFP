import { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import { CURRENCIES, getCurrencySymbol } from '../lib/currency';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  userId: string;
  onCurrencyChange: () => void;
}

export default function CurrencySelector({ userId, onCurrencyChange }: CurrencySelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const { currency, updateCurrency } = useCurrency(userId);

  const handleCurrencySelect = async (newCurrency: string) => {
    await updateCurrency(newCurrency);
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium group"
        title="Change Currency"
      >
        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-md group-hover:bg-white/30 transition-colors">
          <DollarSign size={14} className="sm:w-4 sm:h-4" />
        </div>
        <span className="hidden sm:inline text-sm font-semibold tracking-wide">Currency</span>
        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 sm:p-12 text-white">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <DollarSign size={32} className="sm:w-10 sm:h-10" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">
                  Select Currency
                </h2>
                <p className="text-base sm:text-lg text-center text-white/90">
                  All financial data will be displayed in the selected currency
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    Current Currency: <span className="font-bold text-slate-900">{CURRENCIES.find(c => c.code === currency)?.name} ({getCurrencySymbol(currency)})</span>
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => handleCurrencySelect(curr.code)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          currency === curr.code
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-300 bg-white'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-slate-900">{curr.name}</div>
                          <div className="text-sm text-slate-600">{curr.code}</div>
                        </div>
                        <div className="text-2xl">{curr.symbol}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
