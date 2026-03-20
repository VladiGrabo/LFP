import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Award, Shield, Gem, Crown, Sparkles, CheckCircle } from 'lucide-react';

interface InvestmentPlan {
  name: string;
  nameEn: string;
  investment: number;
  allocation: string;
  returnRate: string;
  positionsPerDay: string;
  startBonus: number;
  holdingBonus: number;
  capitalProtection: number;
  withdrawal: string;
  partnerBonus: number;
  monthlyWithdrawal: string;
  refinancing: string;
  color: string;
  gradient: string;
  icon: any;
  monthlyBreakdown: {
    month: number;
    startBalance: number;
    bonus: string;
    profit: number;
    withdrawal: number;
    endBalance: number;
    totalProfit: number;
  }[];
}

export default function FinancialPlan() {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    // Auto-scroll to details on mobile
    setTimeout(() => {
      const detailsElement = document.getElementById('plan-details');
      if (detailsElement && window.innerWidth < 768) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const plans: InvestmentPlan[] = [
    {
      name: 'Emerald Financial Plan',
      nameEn: 'Emerald',
      investment: 500,
      allocation: '20x80',
      returnRate: 'до 25%',
      positionsPerDay: '2/день',
      startBonus: 10,
      holdingBonus: 15,
      capitalProtection: 70,
      withdrawal: '1/мес',
      partnerBonus: 1,
      monthlyWithdrawal: '10-50%',
      refinancing: 'от 50%',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      icon: Shield,
      monthlyBreakdown: [
        { month: 1, startBalance: 555, bonus: '10% старт', profit: 139, withdrawal: 69, endBalance: 624, totalProfit: 69 },
        { month: 2, startBalance: 724, bonus: '15% удерж.', profit: 181, withdrawal: 91, endBalance: 815, totalProfit: 160 },
        { month: 3, startBalance: 823, bonus: '1% партнёр', profit: 206, withdrawal: 103, endBalance: 926, totalProfit: 263 },
      ],
    },
    {
      name: 'Sapphire Financial Plan',
      nameEn: 'Sapphire',
      investment: 1000,
      allocation: '30x70',
      returnRate: 'до 30%',
      positionsPerDay: '3/день',
      startBonus: 20,
      holdingBonus: 25,
      capitalProtection: 70,
      withdrawal: '1/мес',
      partnerBonus: 2,
      monthlyWithdrawal: '10-50%',
      refinancing: 'от 50%',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      icon: Gem,
      monthlyBreakdown: [
        { month: 1, startBalance: 1222, bonus: '20% старт', profit: 367, withdrawal: 183, endBalance: 1405, totalProfit: 183 },
        { month: 2, startBalance: 1785, bonus: '25% удерж.', profit: 535, withdrawal: 268, endBalance: 2052, totalProfit: 451 },
        { month: 3, startBalance: 2093, bonus: '2% партнёр', profit: 628, withdrawal: 314, endBalance: 2407, totalProfit: 765 },
      ],
    },
    {
      name: 'Ruby Financial Plan',
      nameEn: 'Ruby',
      investment: 3000,
      allocation: '30x70',
      returnRate: 'от 30%',
      positionsPerDay: '5/день',
      startBonus: 30,
      holdingBonus: 35,
      capitalProtection: 75,
      withdrawal: '1/мес',
      partnerBonus: 3,
      monthlyWithdrawal: '10-50%',
      refinancing: 'от 50%',
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      icon: Award,
      monthlyBreakdown: [
        { month: 1, startBalance: 3990, bonus: '30% старт', profit: 1197, withdrawal: 599, endBalance: 4589, totalProfit: 599 },
        { month: 2, startBalance: 6332, bonus: '35% удерж.', profit: 1900, withdrawal: 950, endBalance: 7282, totalProfit: 1549 },
        { month: 3, startBalance: 7501, bonus: '3% партнёр', profit: 2250, withdrawal: 1125, endBalance: 8626, totalProfit: 2673 },
      ],
    },
    {
      name: 'Diamond Financial Plan',
      nameEn: 'Diamond',
      investment: 10000,
      allocation: '40x60',
      returnRate: 'от 36%',
      positionsPerDay: 'Не огранич.',
      startBonus: 40,
      holdingBonus: 35,
      capitalProtection: 80,
      withdrawal: '1/мес',
      partnerBonus: 5,
      monthlyWithdrawal: '10-50%',
      refinancing: 'от 50%',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      icon: Sparkles,
      monthlyBreakdown: [
        { month: 1, startBalance: 14500, bonus: '40% старт', profit: 5220, withdrawal: 2610, endBalance: 17110, totalProfit: 2610 },
        { month: 2, startBalance: 23954, bonus: '35% удерж.', profit: 8623, withdrawal: 4312, endBalance: 28266, totalProfit: 6922 },
        { month: 3, startBalance: 29679, bonus: '5% партнёр', profit: 10684, withdrawal: 5342, endBalance: 35021, totalProfit: 12264 },
      ],
    },
    {
      name: 'Premium+ Financial Plan',
      nameEn: 'Premium+',
      investment: 20000,
      allocation: '40x60',
      returnRate: 'от 45%',
      positionsPerDay: 'Не огранич.',
      startBonus: 50,
      holdingBonus: 35,
      capitalProtection: 90,
      withdrawal: '2/мес',
      partnerBonus: 10,
      monthlyWithdrawal: '10-50%',
      refinancing: 'от 50%',
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-600',
      icon: Crown,
      monthlyBreakdown: [
        { month: 1, startBalance: 32000, bonus: '50% старт', profit: 14400, withdrawal: 7200, endBalance: 39200, totalProfit: 7200 },
        { month: 2, startBalance: 56840, bonus: '35% удерж.', profit: 25578, withdrawal: 12789, endBalance: 69629, totalProfit: 19989 },
        { month: 3, startBalance: 76592, bonus: '10% партнёр', profit: 34466, withdrawal: 17233, endBalance: 93825, totalProfit: 37222 },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      emerald: {
        bg: 'from-emerald-50 to-green-50',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 hover:bg-emerald-700',
      },
      blue: {
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      rose: {
        bg: 'from-rose-50 to-pink-50',
        border: 'border-rose-300',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 hover:bg-rose-700',
      },
      cyan: {
        bg: 'from-cyan-50 to-blue-50',
        border: 'border-cyan-300',
        text: 'text-cyan-700',
        badge: 'bg-cyan-100 text-cyan-700',
        button: 'bg-cyan-600 hover:bg-cyan-700',
      },
      amber: {
        bg: 'from-amber-50 to-yellow-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700',
      },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-semibold text-slate-800">Инвестиционные планы</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colors = getColorClasses(plan.color);
          const totalWithdrawals = plan.monthlyBreakdown[plan.monthlyBreakdown.length - 1].totalProfit;
          const finalBalance = plan.monthlyBreakdown[plan.monthlyBreakdown.length - 1].endBalance;
          const totalProfit = (finalBalance - plan.investment) + totalWithdrawals;

          return (
            <div
              key={plan.nameEn}
              onClick={() => handlePlanSelect(plan)}
              className={`bg-gradient-to-br ${colors.bg} rounded-lg md:rounded-xl shadow-sm border-2 ${colors.border} p-2.5 md:p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan?.nameEn === plan.nameEn ? 'ring-2 ring-offset-2 ring-slate-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 md:mb-4">
                <Icon className={colors.text} size={20} />
                <span className={`${colors.badge} px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold`}>
                  {plan.returnRate}
                </span>
              </div>

              <h3 className={`text-base md:text-lg font-bold ${colors.text} mb-0.5 md:mb-2`}>{plan.nameEn}</h3>
              <p className="text-sm md:text-sm text-slate-600 mb-1.5 md:mb-4">Financial Plan</p>

              <div className="space-y-0.5 md:space-y-2 text-sm md:text-sm mb-1.5 md:mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Инвестиция:</span>
                  <span className="font-bold">€{plan.investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Старт. бонус:</span>
                  <span className="font-bold">{plan.startBonus}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Защита:</span>
                  <span className="font-bold">{plan.capitalProtection}%</span>
                </div>
              </div>

              <div className={`border-t-2 ${colors.border} pt-1.5 md:pt-4`}>
                <div className="text-center">
                  <p className="text-xs md:text-xs text-slate-600 mb-0.5 md:mb-1">Общая прибыль за 3 мес</p>
                  <p className={`text-xl md:text-2xl font-bold ${colors.text}`}>
                    €{totalProfit.toLocaleString()}
                  </p>
                  <p className="text-xs md:text-xs text-slate-500 mt-0.5 md:mt-1">
                    Баланс: €{finalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div id="plan-details" className="bg-white rounded-lg md:rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          <div className={`bg-gradient-to-r ${selectedPlan.gradient} p-3 md:p-6 text-white`}>
            <div className="flex items-center gap-2 md:gap-4">
              <selectedPlan.icon size={32} className="md:w-12 md:h-12" />
              <div>
                <h3 className="text-xl md:text-3xl font-bold">{selectedPlan.name}</h3>
                <p className="text-sm md:text-lg opacity-90">Детальный расчёт инвестиционного плана</p>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-6">
              <div className="bg-slate-50 rounded-lg p-2 md:p-4">
                <p className="text-xs md:text-sm text-slate-600 mb-0.5 md:mb-1">Инвестиция</p>
                <p className="text-base md:text-2xl font-bold text-slate-800">€{selectedPlan.investment.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 md:p-4">
                <p className="text-xs md:text-sm text-slate-600 mb-0.5 md:mb-1">Доходность</p>
                <p className="text-base md:text-2xl font-bold text-emerald-600">{selectedPlan.returnRate}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 md:p-4">
                <p className="text-xs md:text-sm text-slate-600 mb-0.5 md:mb-1">Позиций/день</p>
                <p className="text-base md:text-2xl font-bold text-slate-800">{selectedPlan.positionsPerDay}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 md:p-4">
                <p className="text-xs md:text-sm text-slate-600 mb-0.5 md:mb-1">Защита капитала</p>
                <p className="text-base md:text-2xl font-bold text-blue-600">{selectedPlan.capitalProtection}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-3 md:mb-6">
              <div className="flex items-start gap-1 md:gap-2">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] md:text-xs text-slate-600">Распределение</p>
                  <p className="text-xs md:text-base font-semibold text-slate-800">{selectedPlan.allocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-1 md:gap-2">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] md:text-xs text-slate-600">Старт. бонус</p>
                  <p className="text-xs md:text-base font-semibold text-slate-800">{selectedPlan.startBonus}%</p>
                </div>
              </div>
              <div className="flex items-start gap-1 md:gap-2">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] md:text-xs text-slate-600">Бонус удерж.</p>
                  <p className="text-xs md:text-base font-semibold text-slate-800">{selectedPlan.holdingBonus}%</p>
                </div>
              </div>
              <div className="flex items-start gap-1 md:gap-2">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] md:text-xs text-slate-600">Партнёрский</p>
                  <p className="text-xs md:text-base font-semibold text-slate-800">{selectedPlan.partnerBonus}%</p>
                </div>
              </div>
              <div className="flex items-start gap-1 md:gap-2">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="text-[10px] md:text-xs text-slate-600">Вывод</p>
                  <p className="text-xs md:text-base font-semibold text-slate-800">{selectedPlan.withdrawal}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 md:pt-6">
              <h4 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Помесячная разбивка доходности
              </h4>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-3 font-semibold text-slate-700">Месяц</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Баланс начало</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Бонус</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Прибыль</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Вывод 50%</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Баланс конец</th>
                      <th className="text-right p-3 font-semibold text-emerald-700">Накопл. вывод</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlan.monthlyBreakdown.map((month) => (
                      <tr key={month.month} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium">{month.month}</td>
                        <td className="p-3 text-right">€{month.startBalance.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {month.bonus}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-emerald-600">€{month.profit.toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-600">€{month.withdrawal.toLocaleString()}</td>
                        <td className="p-3 text-right font-semibold">€{month.endBalance.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">€{month.totalProfit.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td className="p-3" colSpan={6}>ИТОГО ВЫВЕДЕНО ЗА 3 МЕСЯЦА</td>
                      <td className="p-3 text-right text-lg text-emerald-700">
                        €{selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].totalProfit.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2">
                {selectedPlan.monthlyBreakdown.map((month) => (
                  <div key={month.month} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-base font-bold text-slate-800">Месяц {month.month}</h5>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {month.bonus}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Баланс начало:</span>
                        <span className="font-semibold">€{month.startBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Прибыль:</span>
                        <span className="font-bold text-emerald-600">€{month.profit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Вывод 50%:</span>
                        <span className="font-semibold text-slate-800">€{month.withdrawal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-300">
                        <span className="text-slate-600">Баланс конец:</span>
                        <span className="font-bold text-slate-800">€{month.endBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between bg-emerald-50 -mx-3 px-3 py-1.5 rounded-b-lg">
                        <span className="text-emerald-700 font-medium">Накопл. вывод:</span>
                        <span className="font-bold text-emerald-700">€{month.totalProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-slate-100 rounded-lg p-3 border-2 border-slate-300">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">ИТОГО ВЫВЕДЕНО ЗА 3 МЕСЯЦА</span>
                    <span className="text-lg font-bold text-emerald-700">
                      €{selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
              <div className="bg-emerald-50 rounded-lg p-3 md:p-4 border-2 border-emerald-200">
                <h5 className="text-sm md:text-base font-semibold text-emerald-800 mb-1 md:mb-2">Общая прибыль</h5>
                <p className="text-xl md:text-3xl font-bold text-emerald-600">
                  €{((selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].endBalance - selectedPlan.investment) + selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].totalProfit).toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-emerald-700 mt-0.5 md:mt-1">Заработано за 3 месяца</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 md:p-4 border-2 border-amber-200">
                <h5 className="text-sm md:text-base font-semibold text-amber-800 mb-1 md:mb-2">Выведено</h5>
                <p className="text-xl md:text-3xl font-bold text-amber-600">
                  €{selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].totalProfit.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-amber-700 mt-0.5 md:mt-1">Накопленные выводы</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 md:p-4 border-2 border-blue-200">
                <h5 className="text-sm md:text-base font-semibold text-blue-800 mb-1 md:mb-2">Финальный баланс</h5>
                <p className="text-xl md:text-3xl font-bold text-blue-600">
                  €{selectedPlan.monthlyBreakdown[selectedPlan.monthlyBreakdown.length - 1].endBalance.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-blue-700 mt-0.5 md:mt-1">На счёте после 3 месяцев</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
