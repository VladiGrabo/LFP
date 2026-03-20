import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Loader2, Target, Clock, TrendingDown } from 'lucide-react';
import { formatAmount } from '../lib/currency';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

interface AIAnalysisProps {
  userId: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    totalAssets: number;
    goalsCount: number;
  };
  netWorth: number;
  goals: Goal[];
  currency: string;
}

interface GoalProjection {
  goalTitle: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  deadline: string;
  monthsUntilDeadline: number;
  currentScenario: {
    monthsNeeded: number;
    achievable: boolean;
    monthlySavingsRequired: number;
  };
  increasedIncomeScenarios: {
    increase20: { monthsNeeded: number; achievable: boolean; monthlySavingsRequired: number };
    increase50: { monthsNeeded: number; achievable: boolean; monthlySavingsRequired: number };
  };
  investmentScenarios: {
    conservative: { monthsNeeded: number; achievable: boolean; monthlyInvestmentRequired: number };
    moderate: { monthsNeeded: number; achievable: boolean; monthlyInvestmentRequired: number };
    aggressive: { monthsNeeded: number; achievable: boolean; monthlyInvestmentRequired: number };
  };
}

interface AnalysisResult {
  analysis: string;
  healthColor: string;
  recommendations: string[];
  goalProjections?: GoalProjection[];
  metrics?: {
    netIncome: number;
    savingsRate: string;
    financialHealth: string;
  };
}

export default function AIAnalysis({ userId, stats, netWorth, goals, currency }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyzeFinances();
  }, [stats, netWorth, goals]);

  const analyzeFinances = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-finances`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalIncome: stats.totalIncome,
          totalExpenses: stats.totalExpenses,
          totalAssets: stats.totalAssets,
          goalsCount: stats.goalsCount,
          netWorth: netWorth,
          goals: goals || [],
          currency: currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze finances');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Не удалось выполнить анализ. Попробуйте позже.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lightgreen':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getHealthIcon = (color: string) => {
    switch (color) {
      case 'green':
      case 'lightgreen':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'yellow':
        return <TrendingUp size={24} className="text-yellow-600" />;
      case 'orange':
      case 'red':
        return <AlertCircle size={24} className="text-red-600" />;
      default:
        return <Brain size={24} className="text-slate-600" />;
    }
  };

  const getPluralForm = (number: number, one: string, few: string, many: string) => {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return one;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return few;
    } else {
      return many;
    }
  };

  const formatMonths = (months: number) => {
    if (months === -1 || months === Infinity) {
      return 'Недостижимо';
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      const yearWord = getPluralForm(years, 'год', 'года', 'лет');
      const monthWord = getPluralForm(remainingMonths, 'месяц', 'месяца', 'месяцев');
      return `${years} ${yearWord} ${remainingMonths} ${monthWord}`;
    } else if (years > 0) {
      const yearWord = getPluralForm(years, 'год', 'года', 'лет');
      return `${years} ${yearWord}`;
    } else {
      const monthWord = getPluralForm(months, 'месяц', 'месяца', 'месяцев');
      return `${months} ${monthWord}`;
    }
  };

  const formatRecommendation = (text: string) => {
    const positivePhrases = [
      'значительно выше среднего',
      'значительно выше',
      'выше среднего',
      'эффективное распределение',
      'солидная база',
      'оптимизацию доходности',
      'оптимизация',
      'оптимизацию'
    ];

    const negativePhrases = [
      'избыточной ликвидности',
      'отрицательный денежный поток',
      'критически высокий',
      'критично',
      'критический',
      'критическая',
      'дефицит'
    ];

    const allMatches: Array<{ start: number; end: number; type: 'positive' | 'negative' | 'number' }> = [];

    positivePhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'positive' });
      }
    });

    negativePhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'negative' });
      }
    });

    const numberRegex = /\d+[.,]?\d*%?/g;
    let numberMatch;
    while ((numberMatch = numberRegex.exec(text)) !== null) {
      allMatches.push({ start: numberMatch.index, end: numberMatch.index + numberMatch[0].length, type: 'number' });
    }

    allMatches.sort((a, b) => a.start - b.start);

    const mergedMatches: typeof allMatches = [];
    allMatches.forEach(match => {
      if (mergedMatches.length === 0) {
        mergedMatches.push(match);
      } else {
        const last = mergedMatches[mergedMatches.length - 1];
        if (match.start < last.end) {
          if (match.end > last.end) {
            last.end = match.end;
          }
        } else {
          mergedMatches.push(match);
        }
      }
    });

    let currentIndex = 0;
    const finalParts: JSX.Element[] = [];

    mergedMatches.forEach((match, idx) => {
      if (currentIndex < match.start) {
        finalParts.push(<span key={`normal-${idx}`}>{text.slice(currentIndex, match.start)}</span>);
      }

      const matchedText = text.slice(match.start, match.end);

      if (match.type === 'positive') {
        finalParts.push(
          <span key={`match-${idx}`} className="font-semibold text-emerald-700">
            {matchedText}
          </span>
        );
      } else if (match.type === 'negative') {
        finalParts.push(
          <span key={`match-${idx}`} className="font-semibold text-orange-600">
            {matchedText}
          </span>
        );
      } else if (match.type === 'number') {
        finalParts.push(
          <span key={`match-${idx}`} className="font-semibold text-slate-900">
            {matchedText}
          </span>
        );
      }

      currentIndex = match.end;
    });

    if (currentIndex < text.length) {
      finalParts.push(<span key="final">{text.slice(currentIndex)}</span>);
    }

    return <>{finalParts}</>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-600">Анализируем ваши финансы...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} className="text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <Brain size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Рекомендации</h2>
          <p className="text-slate-600">Персонализированная оценка вашего финансового положения</p>
        </div>
      </div>

      {analysis.metrics && (
        <div className={`border-2 rounded-xl p-6 ${getHealthColorClass(analysis.healthColor)}`}>
          <div className="flex items-center gap-3 mb-4">
            {getHealthIcon(analysis.healthColor)}
            <h3 className="text-lg font-bold capitalize">
              Финансовое здоровье: {analysis.metrics.financialHealth}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Чистый доход:</span>
              <span className="ml-2">{formatAmount(Number(analysis.metrics.netIncome), currency)}</span>
            </div>
            <div>
              <span className="font-medium">Норма сбережений:</span>
              <span className="ml-2">{analysis.metrics.savingsRate}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-emerald-600" />
          Детальный анализ
        </h3>

        {(() => {
          const lines = analysis.analysis.split('\n');
          const firstParagraph = lines[0];
          const metricsStartIndex = lines.findIndex(line => line.includes('**Общая картина:**'));

          if (metricsStartIndex === -1) {
            return (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                  {analysis.analysis}
                </pre>
              </div>
            );
          }

          const metricsLines = [];
          for (let i = metricsStartIndex + 1; i < lines.length; i++) {
            if (lines[i].trim().startsWith('•')) {
              metricsLines.push(lines[i]);
            } else if (lines[i].trim() === '') {
              break;
            }
          }

          const parseMetric = (line: string) => {
            const match = line.match(/• (.+?):\s*(.+)/);
            if (match) {
              return { label: match[1].trim(), value: match[2].trim() };
            }
            return null;
          };

          const metrics = metricsLines.map(parseMetric).filter(Boolean);

          const getMetricIcon = (label: string) => {
            if (label.includes('капитал')) return { icon: '💰', color: 'from-emerald-500 to-teal-600' };
            if (label.includes('доход')) return { icon: '📈', color: 'from-blue-500 to-cyan-600' };
            if (label.includes('расход')) return { icon: '💳', color: 'from-orange-500 to-amber-600' };
            if (label.includes('актив')) return { icon: '🏦', color: 'from-purple-500 to-indigo-600' };
            if (label.includes('сбережен')) return { icon: '🎯', color: 'from-pink-500 to-rose-600' };
            return { icon: '📊', color: 'from-slate-500 to-gray-600' };
          };

          return (
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed bg-slate-100 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                {firstParagraph}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, idx) => {
                  const { icon, color } = getMetricIcon(metric.label);
                  return (
                    <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-lg shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-600 mb-1">
                            {metric.label}
                          </div>
                          <div className="text-lg font-bold text-slate-900 truncate">
                            {metric.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {analysis.goalProjections && analysis.goalProjections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={24} className="text-emerald-600" />
            <h3 className="font-bold text-xl text-slate-900">Анализ достижения целей</h3>
          </div>

          {analysis.goalProjections.map((projection, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <h4 className="font-bold text-lg text-slate-900 mb-2">{projection.goalTitle}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Целевая сумма:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {formatAmount(projection.targetAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Текущий прогресс:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {formatAmount(projection.currentAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Осталось накопить:</span>
                    <span className="ml-2 font-semibold text-emerald-700">
                      {formatAmount(projection.remainingAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Дедлайн:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {new Date(projection.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`border-2 rounded-lg p-4 ${projection.currentScenario.achievable ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className={projection.currentScenario.achievable ? 'text-green-700' : 'text-red-700'} />
                    <h5 className="font-bold text-sm">При текущем доходе</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-700">Времени потребуется:</span>
                      <span className="ml-2 font-semibold">{formatMonths(projection.currentScenario.monthsNeeded)}</span>
                    </div>
                    <div>
                      <span className="text-slate-700">К дедлайну:</span>
                      <span className={`ml-2 font-semibold ${projection.currentScenario.achievable ? 'text-green-700' : 'text-orange-700'}`}>
                        {projection.currentScenario.achievable ? '✓ Достижимо' : 'Сложно при текущих условиях'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-700">Нужно откладывать:</span>
                      <span className="ml-2 font-semibold">
                        {formatAmount(projection.currentScenario.monthlySavingsRequired, currency)}/месяц
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Рекомендации
          </h3>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{formatRecommendation(rec)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600 text-center">
          Анализ обновляется автоматически при изменении данных
        </p>
      </div>
    </div>
  );
}
