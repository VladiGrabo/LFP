import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalAssets: number;
  goalsCount: number;
  netWorth: number;
  goals: Goal[];
  currency?: string;
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

function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'RUB': '₽',
    'JPY': '¥',
    'CNY': '¥',
  };
  return symbols[currency] || currency;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-GB')}`;
}

function calculateMonthsUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const months = (deadlineDate.getFullYear() - today.getFullYear()) * 12 +
                 (deadlineDate.getMonth() - today.getMonth());
  return Math.max(0, months);
}

function calculateGoalProjections(
  goals: Goal[],
  monthlySavings: number,
  totalIncome: number
): GoalProjection[] {
  return goals.map(goal => {
    const remainingAmount = Number(goal.target_amount) - Number(goal.current_amount);
    const monthsUntilDeadline = calculateMonthsUntilDeadline(goal.deadline);

    const currentMonthsNeeded = monthlySavings > 0 ? Math.ceil(remainingAmount / monthlySavings) : Infinity;
    const currentAchievable = currentMonthsNeeded <= monthsUntilDeadline && currentMonthsNeeded !== Infinity;
    const monthlySavingsRequired = monthsUntilDeadline > 0 ? remainingAmount / monthsUntilDeadline : remainingAmount;

    const income20 = totalIncome * 1.2;
    const savings20 = monthlySavings * 1.2;
    const months20 = savings20 > 0 ? Math.ceil(remainingAmount / savings20) : Infinity;
    const achievable20 = months20 <= monthsUntilDeadline && months20 !== Infinity;

    const income50 = totalIncome * 1.5;
    const savings50 = monthlySavings * 1.5;
    const months50 = savings50 > 0 ? Math.ceil(remainingAmount / savings50) : Infinity;
    const achievable50 = months50 <= monthsUntilDeadline && months50 !== Infinity;

    const calculateInvestmentMonths = (annualReturn: number, monthlyInvestment: number) => {
      if (monthlyInvestment <= 0) return Infinity;
      const monthlyRate = annualReturn / 12 / 100;
      if (monthlyRate === 0) return Math.ceil(remainingAmount / monthlyInvestment);

      const months = Math.log(
        (remainingAmount * monthlyRate) / monthlyInvestment + 1
      ) / Math.log(1 + monthlyRate);

      return Math.ceil(months);
    };

    const conservativeReturn = 5;
    const conservativeMonths = calculateInvestmentMonths(conservativeReturn, monthlySavings);
    const conservativeAchievable = conservativeMonths <= monthsUntilDeadline && conservativeMonths !== Infinity;

    const moderateReturn = 8;
    const moderateMonths = calculateInvestmentMonths(moderateReturn, monthlySavings);
    const moderateAchievable = moderateMonths <= monthsUntilDeadline && moderateMonths !== Infinity;

    const aggressiveReturn = 12;
    const aggressiveMonths = calculateInvestmentMonths(aggressiveReturn, monthlySavings);
    const aggressiveAchievable = aggressiveMonths <= monthsUntilDeadline && aggressiveMonths !== Infinity;

    return {
      goalTitle: goal.title,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      remainingAmount,
      deadline: goal.deadline,
      monthsUntilDeadline,
      currentScenario: {
        monthsNeeded: currentMonthsNeeded === Infinity ? -1 : currentMonthsNeeded,
        achievable: currentAchievable,
        monthlySavingsRequired,
      },
      increasedIncomeScenarios: {
        increase20: {
          monthsNeeded: months20 === Infinity ? -1 : months20,
          achievable: achievable20,
          monthlySavingsRequired: savings20,
        },
        increase50: {
          monthsNeeded: months50 === Infinity ? -1 : months50,
          achievable: achievable50,
          monthlySavingsRequired: savings50,
        },
      },
      investmentScenarios: {
        conservative: {
          monthsNeeded: conservativeMonths === Infinity ? -1 : conservativeMonths,
          achievable: conservativeAchievable,
          monthlyInvestmentRequired: monthlySavings,
        },
        moderate: {
          monthsNeeded: moderateMonths === Infinity ? -1 : moderateMonths,
          achievable: moderateAchievable,
          monthlyInvestmentRequired: monthlySavings,
        },
        aggressive: {
          monthsNeeded: aggressiveMonths === Infinity ? -1 : aggressiveMonths,
          achievable: aggressiveAchievable,
          monthlyInvestmentRequired: monthlySavings,
        },
      },
    };
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { totalIncome, totalExpenses, totalAssets, goalsCount, netWorth, goals, currency = 'USD' }: FinancialData = await req.json();

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    const hasInvestments = totalAssets > totalExpenses * 3;

    let financialFormula = '';
    let formulaDescription = '';
    let financialHealth = 'нестабильное';
    let healthColor = 'orange';
    let healthDescription = 'нестабильном';

    if (netIncome < 0) {
      financialFormula = 'Формула банкротства';
      formulaDescription = 'ДОХОДЫ - РАСХОДЫ = ДОЛГИ';
      financialHealth = 'критическое';
      healthColor = 'red';
      healthDescription = 'критическом';
    } else if (netIncome >= 0 && netIncome < totalIncome * 0.05) {
      financialFormula = 'Первая формула бедности';
      formulaDescription = 'ДОХОДЫ - РАСХОДЫ = 0 (живёте от зарплаты до зарплаты)';
      financialHealth = 'нестабильное';
      healthColor = 'orange';
      healthDescription = 'нестабильном';
    } else if (netIncome > 0 && !hasInvestments) {
      financialFormula = 'Вторая формула бедности';
      formulaDescription = 'ДОХОДЫ - РАСХОДЫ = НАКОПЛЕНИЯ (но накопления тратятся, а не инвестируются)';
      financialHealth = savingsRate >= 15 ? 'хорошее' : 'стабильное';
      healthColor = savingsRate >= 15 ? 'lightgreen' : 'yellow';
      healthDescription = savingsRate >= 15 ? 'хорошем' : 'стабильном';
    } else if (netIncome > 0 && hasInvestments) {
      financialFormula = 'Формула богатства';
      formulaDescription = 'ДОХОДЫ - РАСХОДЫ = НАКОПЛЕНИЯ * % = КАПИТАЛ';
      financialHealth = 'отличное';
      healthColor = 'green';
      healthDescription = 'отличном';
    }

    let analysis = `На основе ваших данных, вы находитесь на уровне: ${financialFormula}\n${formulaDescription}\n\n`;

    if (totalIncome === 0 && totalExpenses === 0 && totalAssets === 0) {
      analysis = 'Добро пожаловать в FinancePlan! Начните добавлять свои доходы, расходы и активы, чтобы получить персонализированный анализ.';

      return new Response(
        JSON.stringify({ analysis, healthColor, recommendations: [], goalProjections: [] }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    analysis += `📊 Общая картина:\n`;
    analysis += `• Чистый капитал: ${formatAmount(netWorth, currency)}\n`;
    analysis += `• Месячный доход: ${formatAmount(totalIncome, currency)}\n`;
    analysis += `• Месячные расходы: ${formatAmount(totalExpenses, currency)}\n`;
    analysis += `• Всего активов: ${formatAmount(totalAssets, currency)}\n`;
    analysis += `• Норма сбережений: ${savingsRate.toFixed(1)}%\n\n`;

    const recommendations: string[] = [];
    const goalProjections = goals && goals.length > 0 ? calculateGoalProjections(goals, netIncome, totalIncome) : [];

    recommendations.push('📚 Что означает ваша финансовая формула:');

    if (financialFormula === 'Формула банкротства') {
      const deficit = Math.abs(netIncome);
      const deficitPercentage = ((deficit / totalIncome) * 100).toFixed(1);
      const targetReduction = deficit * 0.35;

      recommendations.push('⚠️ ДОХОДЫ - РАСХОДЫ = ДОЛГИ');
      recommendations.push(`Ваш месячный дефицит: ${formatAmount(deficit, currency)} (${deficitPercentage}% от дохода). Расходы превышают доходы, что ведёт к накоплению долгов. Это критическая ситуация, требующая немедленных действий.`);
      recommendations.push(`🎯 Главная цель: выйти на нулевой баланс, сократив расходы на ${formatAmount(deficit, currency)}/мес или увеличив доход`);
      recommendations.push('📋 Конкретный план действий:');
      recommendations.push(`1. Проанализируйте расходы ${formatAmount(totalExpenses, currency)}/мес и разделите на обязательные (жильё, еда, транспорт) и необязательные`);
      recommendations.push(`2. Сократите необязательные расходы на 35-40% - это даст экономию около ${formatAmount(targetReduction, currency)}/мес`);
      recommendations.push(`3. Найдите дополнительный доход: подработка, фриланс, продажа ненужных вещей - цель ${formatAmount(deficit - targetReduction, currency)}/мес`);
      recommendations.push(`4. Договоритесь с кредиторами о реструктуризации долгов для снижения ежемесячных платежей`);
      recommendations.push(`5. После выхода на баланс начните откладывать 5% дохода (${formatAmount(totalIncome * 0.05, currency)}/мес) для создания подушки безопасности`);
    } else if (financialFormula === 'Первая формула бедности') {
      const targetSavings = totalIncome * 0.15;
      const emergencyFund = totalExpenses * 3;
      const monthsToEmergencyFund = Math.ceil(emergencyFund / targetSavings);

      recommendations.push('📍 ДОХОДЫ - РАСХОДЫ = 0 (по этой формуле живёт 40.8% людей)');
      recommendations.push(`Вы тратите все ${formatAmount(totalIncome, currency)}/мес что зарабатываете. Нет подушки безопасности на случай непредвиденных ситуаций (потеря работы, болезнь, срочные расходы).`);
      recommendations.push(`🎯 Главная цель: начать откладывать 15% дохода (${formatAmount(targetSavings, currency)}/мес) для перехода на следующий уровень`);
      recommendations.push('📋 Конкретный план действий:');
      recommendations.push(`1. Примените правило 50/30/20: обязательные расходы ${formatAmount(totalIncome * 0.5, currency)}, желания ${formatAmount(totalIncome * 0.3, currency)}, накопления ${formatAmount(totalIncome * 0.2, currency)}`);
      recommendations.push(`2. Начните откладывать ${formatAmount(targetSavings, currency)}/мес (15% дохода) СРАЗУ после получения зарплаты - настройте автоперевод`);
      recommendations.push(`3. Первая цель: резервный фонд ${formatAmount(emergencyFund, currency)} (3 месяца расходов) - достигнете за ${monthsToEmergencyFund} месяцев`);
      recommendations.push(`4. Сократите расходы ${formatAmount(totalExpenses, currency)}/мес минимум на 10-15% за счёт подписок и необязательных трат`);
      recommendations.push(`5. После создания резервного фонда увеличьте норму сбережений до 20% (${formatAmount(totalIncome * 0.2, currency)}/мес)`);
    } else if (financialFormula === 'Вторая формула бедности') {
      const currentSavings = netIncome;
      const targetInvestment = totalIncome * 0.2;
      const emergencyFund = totalExpenses * 6;
      const investmentReturn5 = targetInvestment * 12 * 1.05;
      const investmentReturn8 = targetInvestment * 12 * 1.08;

      recommendations.push('💰 ДОХОДЫ - РАСХОДЫ = НАКОПЛЕНИЯ (по этой формуле живёт 32.5% людей)');
      recommendations.push(`Вы откладываете ${formatAmount(currentSavings, currency)}/мес (${savingsRate.toFixed(1)}% дохода). Проблема: накопления тратятся на крупные покупки вместо того, чтобы работать и создавать капитал.`);
      recommendations.push(`🎯 Главная цель: разделить деньги на резервный фонд и инвестиционный капитал для перехода к формуле богатства`);
      recommendations.push('📋 Конкретный план действий:');
      recommendations.push(`1. Создайте резервный фонд ${formatAmount(emergencyFund, currency)} (6 месяцев расходов) - это неприкосновенный запас на высокодоходном депозите`);
      recommendations.push(`2. Всё сверх резервного фонда инвестируйте - минимум ${formatAmount(targetInvestment, currency)}/мес (20% дохода) на 3-5 лет без изъятий`);
      recommendations.push(`3. Начните с безопасных инструментов: депозиты 5-7% годовых (через год: +${formatAmount(investmentReturn5 - targetInvestment * 12, currency)}), облигации, индексные ETF`);
      recommendations.push(`4. При доходности 8% годовых ваш капитал: через 1 год ${formatAmount(investmentReturn8, currency)}, через 5 лет ${formatAmount(targetInvestment * 12 * 5 * 1.47, currency)}, через 10 лет ${formatAmount(targetInvestment * 12 * 10 * 2.16, currency)}`);
      recommendations.push(`5. Изучите основы инвестирования: "Богатый папа, бедный папа", "Разумный инвестор", базовые ETF и облигации`);
    } else if (financialFormula === 'Формула богатства') {
      const currentCapital = totalAssets;
      const monthlyInvestment = netIncome;
      const financialFreedomCapital = totalExpenses * 12 * 25;
      const monthlyPassiveIncome = currentCapital * 0.04 / 12;
      const yearsToFreedom = currentCapital > 0 ? Math.ceil((financialFreedomCapital - currentCapital) / (monthlyInvestment * 12)) : Math.ceil(financialFreedomCapital / (monthlyInvestment * 12));

      recommendations.push('🎉 ДОХОДЫ - РАСХОДЫ = НАКОПЛЕНИЯ × % = КАПИТАЛ');
      recommendations.push(`Ваш капитал ${formatAmount(currentCapital, currency)} работает и приумножается! Вы откладываете ${formatAmount(monthlyInvestment, currency)}/мес (${savingsRate.toFixed(1)}% дохода). Вы на верном пути к финансовой независимости.`);
      recommendations.push(`🎯 Главная цель: достичь цифры свободы ${formatAmount(financialFreedomCapital, currency)}, чтобы пассивный доход 4%/год (${formatAmount(financialFreedomCapital * 0.04 / 12, currency)}/мес) покрывал расходы ${formatAmount(totalExpenses, currency)}/мес`);
      recommendations.push('📋 Конкретный план действий:');
      recommendations.push(`1. Диверсифицируйте портфель ${formatAmount(currentCapital, currency)}: 40-50% облигации/депозиты, 30-40% акции/ETF, 10-20% альтернативы (недвижимость, криптовалюта)`);
      recommendations.push(`2. Реинвестируйте всю прибыль - компаунд-эффект удвоит капитал за 7-10 лет (${formatAmount(currentCapital * 2, currency)})`);
      recommendations.push(`3. При текущих накоплениях ${formatAmount(monthlyInvestment, currency)}/мес достигнете финансовой свободы примерно через ${yearsToFreedom} лет`);
      recommendations.push(`4. Текущий пассивный доход (4%/год): ${formatAmount(monthlyPassiveIncome, currency)}/мес - это ${(monthlyPassiveIncome / totalExpenses * 100).toFixed(1)}% от ваших расходов`);
      recommendations.push(`5. Создавайте новые источники дохода: дивидендные акции, сдача недвижимости, роялти - цель +${formatAmount(totalExpenses - monthlyPassiveIncome, currency)}/мес пассивного дохода`);
    }

    if (savingsRate >= 10 && savingsRate < 20 && financialFormula !== 'Формула банкротства') {
      const targetSavings = totalIncome * 0.2;
      const additionalSavingsNeeded = targetSavings - netIncome;
      recommendations.push(`📊 Норма сбережений ${savingsRate.toFixed(1)}% - хороший старт! Для перехода на следующий уровень увеличьте до 20%, откладывая дополнительно ${formatAmount(additionalSavingsNeeded, currency)}/мес`);
    }

    if (savingsRate >= 20 && savingsRate < 30 && financialFormula === 'Формула богатства') {
      const conservativeAmount = totalAssets * 0.25;
      const growthAmount = totalAssets * 0.55;
      recommendations.push(`💼 Норма сбережений ${savingsRate.toFixed(1)}% в оптимальном диапазоне. Структура портфеля: консервативная часть ${formatAmount(conservativeAmount, currency)} (25%), рост ${formatAmount(growthAmount, currency)} (55%), резервы ${formatAmount(totalAssets * 0.2, currency)} (20%)`);
    }

    if (savingsRate >= 30 && financialFormula === 'Формула богатства') {
      const yearlyInvestment = netIncome * 12;
      const in5years = yearlyInvestment * 5 * 1.47;
      recommendations.push(`🌟 Норма сбережений ${savingsRate.toFixed(1)}% значительно выше среднего! При таких темпах через 5 лет накопите ${formatAmount(in5years, currency)} (с доходностью 8%/год)`);
    }

    if (goalsCount === 0 && financialFormula !== 'Формула банкротства') {
      recommendations.push(`🎯 Рекомендую поставить финансовые цели (например: резервный фонд ${formatAmount(totalExpenses * 6, currency)}, первоначальный взнос за жильё, образование) - это мотивирует к накоплениям`);
    } else if (goalProjections.length > 0) {
      const unachievableGoals = goalProjections.filter(g => !g.currentScenario.achievable).length;

      if (unachievableGoals > 0) {
        const maxRequired = Math.max(...goalProjections.map(g => g.currentScenario.monthlySavingsRequired));
        recommendations.push(`🎯 Из ${goalsCount} целей ${unachievableGoals} требуют корректировки: либо продлите сроки, либо увеличьте накопления с ${formatAmount(netIncome, currency)}/мес до ${formatAmount(maxRequired, currency)}/мес`);
      }
    }

    if (totalAssets > 0) {
      const emergencyFundMonths = totalAssets / totalExpenses;
      const excessLiquidity = totalAssets - (totalExpenses * 6);

      if (emergencyFundMonths < 3 && financialFormula !== 'Формула банкротства') {
        const needMore = (totalExpenses * 3) - totalAssets;
        recommendations.push(`🏦 Резервный фонд ${formatAmount(totalAssets, currency)} покрывает только ${emergencyFundMonths.toFixed(1)} мес расходов. Доведите до 3-6 месяцев, добавив ещё ${formatAmount(needMore, currency)}`);
      } else if (emergencyFundMonths >= 6 && excessLiquidity > 0) {
        recommendations.push(`✅ Резервный фонд ${emergencyFundMonths.toFixed(1)} месяцев - отлично! Излишек ${formatAmount(excessLiquidity, currency)} можно инвестировать для роста капитала`);
      }

      const assetsToIncomeRatio = totalAssets / (totalIncome * 12);
      if (assetsToIncomeRatio >= 3 && financialFormula === 'Формула богатства') {
        const annualReturn = totalAssets * 0.08;
        recommendations.push(`🏆 Капитал ${formatAmount(totalAssets, currency)} = ${assetsToIncomeRatio.toFixed(1)} годовых доходов! При доходности 8%/год получите ${formatAmount(annualReturn, currency)}/год (${formatAmount(annualReturn / 12, currency)}/мес) пассивного дохода`);
      }
    } else if (financialFormula === 'Вторая формула бедности') {
      const emergencyTarget = totalExpenses * 4;
      recommendations.push(`🏦 У вас нет учтённых активов. Первый приоритет: создать резервный фонд ${formatAmount(emergencyTarget, currency)} (4 месяца расходов) на отдельном счёте`);
    }

    if (netIncome > 0 && savingsRate < 30 && (financialFormula === 'Вторая формула бедности' || financialFormula === 'Первая формула бедности')) {
      const incomeIncrease20 = totalIncome * 0.2;
      const newSavings = (totalIncome * 1.2) - totalExpenses;
      recommendations.push(`💡 Если увеличите доход на 20% (+${formatAmount(incomeIncrease20, currency)}/мес), сможете откладывать ${formatAmount(newSavings, currency)}/мес вместо текущих ${formatAmount(netIncome, currency)}/мес`);
    }

    if (totalIncome > 5000 && savingsRate >= 20 && financialFormula === 'Формула богатства') {
      const taxOptimization = totalIncome * 12 * 0.13 * 0.3;
      recommendations.push(`📋 При доходе ${formatAmount(totalIncome, currency)}/мес используйте налоговые льготы: ИИС (вычет до ${formatAmount(52000, currency)}/год), пенсионные взносы - экономия до ${formatAmount(taxOptimization, currency)}/год`);
    }

    const response = {
      analysis,
      healthColor,
      recommendations,
      goalProjections,
      metrics: {
        netIncome,
        savingsRate: savingsRate.toFixed(1),
        financialHealth,
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Ошибка анализа' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});