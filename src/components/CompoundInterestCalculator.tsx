import { useState } from 'react';
import { Calculator, TrendingUp, PieChart, ChevronDown, ChevronRight } from 'lucide-react';
import { formatAmount } from '../lib/currency';

interface CompoundInterestCalculatorProps {
  currency: string;
}

interface MonthlyBreakdown {
  month: number;
  startBalance: number;
  interestEarned: number;
  contribution: number;
  endBalance: number;
}

export default function CompoundInterestCalculator({ currency }: CompoundInterestCalculatorProps) {
  const [principal, setPrincipal] = useState('10000');
  const [timeValue, setTimeValue] = useState('5');
  const [timeUnit, setTimeUnit] = useState<'months' | 'years'>('years');
  const [rate, setRate] = useState('10');
  const [reinvest, setReinvest] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [result, setResult] = useState<any>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal) || 0;
    const r = parseFloat(rate) / 100 || 0;
    const contribution = parseFloat(contributionAmount) || 0;
    let totalMonths = timeUnit === 'years'
      ? (parseFloat(timeValue) || 0) * 12
      : parseFloat(timeValue) || 0;

    let balance = P;
    let accumulatedInterest = 0;
    const monthlyRate = r / 12;
    const contributionMonths = contributionFrequency === 'monthly' ? 1 : contributionFrequency === 'quarterly' ? 3 : 12;

    const yearlyBreakdown = [];
    const monthlyBreakdown: MonthlyBreakdown[] = [];

    for (let month = 1; month <= totalMonths; month++) {
      const startBalance = balance;
      let interestEarned = balance * monthlyRate;
      let contributionThisMonth = 0;

      if (reinvest) {
        balance = balance * (1 + monthlyRate);
      } else {
        accumulatedInterest += interestEarned;
      }

      if (month % contributionMonths === 0) {
        contributionThisMonth = contribution;
        balance += contribution;
      }

      const endBalance = reinvest ? balance : balance + accumulatedInterest;

      monthlyBreakdown.push({
        month: month,
        startBalance: startBalance,
        interestEarned: interestEarned,
        contribution: contributionThisMonth,
        endBalance: endBalance,
      });

      if (month % 12 === 0) {
        yearlyBreakdown.push({
          year: month / 12,
          balance: endBalance,
          interest: reinvest
            ? balance - P - (contribution * Math.floor(month / contributionMonths))
            : accumulatedInterest,
        });
      }
    }

    const finalBalance = reinvest ? balance : balance + accumulatedInterest;

    if (totalMonths % 12 !== 0) {
      yearlyBreakdown.push({
        year: totalMonths / 12,
        balance: finalBalance,
        interest: reinvest
          ? balance - P - (contribution * Math.floor(totalMonths / contributionMonths))
          : accumulatedInterest,
      });
    }

    const totalInterest = reinvest
      ? balance - P - (contribution * Math.floor(totalMonths / contributionMonths))
      : accumulatedInterest;
    const totalContributions = contribution * Math.floor(totalMonths / contributionMonths);
    const growthPercentage = ((finalBalance - P) / P) * 100;

    setResult({
      finalBalance: finalBalance,
      totalInterest: totalInterest,
      totalContributions: totalContributions,
      initialPrincipal: P,
      growthPercentage: growthPercentage,
      yearlyBreakdown: yearlyBreakdown,
      monthlyBreakdown: monthlyBreakdown,
    });
  };

  const resetCalculator = () => {
    setResult(null);
    setExpandedYears(new Set());
  };

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const groupMonthsByYear = (monthlyData: MonthlyBreakdown[]) => {
    const years: { [key: number]: MonthlyBreakdown[] } = {};

    monthlyData.forEach((month) => {
      const year = Math.ceil(month.month / 12);
      if (!years[year]) {
        years[year] = [];
      }
      years[year].push(month);
    });

    return years;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Calculator className="text-emerald-600" size={28} />
          Калькулятор сложного процента
        </h2>
        <p className="text-slate-600">
          Рассчитайте доходность инвестиций с учетом реинвестирования и регулярных пополнений
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Стартовый капитал
            </label>
            <div className="relative">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                {currency}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Срок инвестирования
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="5"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as 'months' | 'years')}
                className="px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="months">месяцев</option>
                <option value="years">лет</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ставка
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-3 pr-20 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                % годовых
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer mt-8">
              <input
                type="checkbox"
                checked={reinvest}
                onChange={(e) => setReinvest(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-slate-900 font-medium">
                Реинвестировать доход
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Доп. вложения / изъятия
            </label>
            <div className="relative">
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                {currency}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Периодичность
            </label>
            <select
              value={contributionFrequency}
              onChange={(e) => setContributionFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
              className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              <option value="monthly">Раз в месяц</option>
              <option value="quarterly">Раз в квартал</option>
              <option value="yearly">Раз в год</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={calculateCompoundInterest}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Calculator size={20} />
            РАССЧИТАТЬ
          </button>
          {result && (
            <button
              onClick={resetCalculator}
              className="px-6 py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all"
            >
              Сброс
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={24} />
            Результаты расчета
          </h3>

          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Сумма всех пополнений</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatAmount(result.totalContributions, currency)}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="text-sm text-slate-600 mb-1">Доход</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatAmount(result.totalInterest, currency)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-slate-600 mb-1">Итоговая сумма</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatAmount(result.finalBalance, currency)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-slate-600 mb-1">Прирост</p>
                  <p className="text-xl font-bold text-orange-700">
                    {result.growthPercentage.toFixed(2)} %
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <PieChart size={20} />
                    Анализ
                  </h4>
                  <div className="flex items-center justify-center">
                    <PieChartComponent
                      data={[
                        { label: 'Начальная сумма', value: result.initialPrincipal, color: '#3b82f6' },
                        { label: 'Доход', value: result.totalInterest, color: '#10b981' },
                        { label: 'Пополнения', value: result.totalContributions, color: '#f97316' },
                      ]}
                      currency={currency}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Сводка</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">Начальная сумма</p>
                        <p className="font-semibold text-slate-900">{formatAmount(result.initialPrincipal, currency)}</p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {((result.initialPrincipal / result.finalBalance) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">Доход</p>
                        <p className="font-semibold text-slate-900">{formatAmount(result.totalInterest, currency)}</p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {((result.totalInterest / result.finalBalance) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">Пополнения</p>
                        <p className="font-semibold text-slate-900">{formatAmount(result.totalContributions, currency)}</p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {((result.totalContributions / result.finalBalance) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {result.monthlyBreakdown && result.monthlyBreakdown.length > 0 && (
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Детальная разбивка</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Период</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Начальная сумма</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Процентный доход</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Вложения</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Конечная сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const yearlyData = groupMonthsByYear(result.monthlyBreakdown);
                        const years = Object.keys(yearlyData).map(Number).sort((a, b) => a - b);

                        return years.map((year) => {
                          const monthsInYear = yearlyData[year];
                          const lastMonthOfYear = monthsInYear[monthsInYear.length - 1];
                          const firstMonthOfYear = monthsInYear[0];
                          const isExpanded = expandedYears.has(year);

                          const yearTotalInterest = monthsInYear.reduce((sum, m) => sum + m.interestEarned, 0);
                          const yearTotalContributions = monthsInYear.reduce((sum, m) => sum + m.contribution, 0);

                          return (
                            <>
                              <tr
                                key={`year-${year}`}
                                onClick={() => toggleYear(year)}
                                className="bg-blue-50 hover:bg-blue-100 cursor-pointer border-b-2 border-blue-200 font-semibold transition-colors"
                              >
                                <td className="py-3 px-4 text-slate-900">
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronDown size={18} className="text-blue-600" />
                                    ) : (
                                      <ChevronRight size={18} className="text-blue-600" />
                                    )}
                                    <span>Год {year}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-900">
                                  {formatAmount(firstMonthOfYear.startBalance, currency)}
                                </td>
                                <td className="py-3 px-4 text-right text-emerald-700">
                                  {formatAmount(yearTotalInterest, currency)}
                                </td>
                                <td className="py-3 px-4 text-right text-orange-700">
                                  {formatAmount(yearTotalContributions, currency)}
                                </td>
                                <td className="py-3 px-4 text-right text-slate-900">
                                  {formatAmount(lastMonthOfYear.endBalance, currency)}
                                </td>
                              </tr>

                              {isExpanded && monthsInYear.map((month, idx) => (
                                <tr
                                  key={`month-${month.month}`}
                                  className="border-b border-slate-100 hover:bg-slate-50 bg-white"
                                >
                                  <td className="py-3 px-4 pl-12 text-slate-700">
                                    Месяц {((year - 1) * 12) + (idx + 1)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-700">
                                    {formatAmount(month.startBalance, currency)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-emerald-600">
                                    {formatAmount(month.interestEarned, currency)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-orange-600">
                                    {formatAmount(month.contribution, currency)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-700">
                                    {formatAmount(month.endBalance, currency)}
                                  </td>
                                </tr>
                              ))}
                            </>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  currency: string;
}

function PieChartComponent({ data, currency }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 80;

  let currentAngle = -90;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return {
      path,
      color: item.color,
      percentage: percentage.toFixed(0),
      label: item.label,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-0">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-4 space-y-2 w-full">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-slate-700">{segment.label}</span>
            <span className="ml-auto font-semibold text-slate-900">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
