import { useState } from 'react';
import { TrendingUp, Target, Brain, DollarSign, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { CURRENCIES } from '../lib/currency';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  const slides = [
    {
      icon: Target,
      title: 'Добро пожаловать в FinancePlan',
      description: 'Ваш персональный помощник для достижения финансовых целей',
      content: 'Мы поможем вам построить надежное финансовое будущее через систематическое планирование и интеллектуальный анализ.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: TrendingUp,
      title: 'Почему важно планировать финансы?',
      description: 'Финансовое планирование — это ключ к стабильности',
      content: 'Без четкого плана 78% людей не достигают своих финансовых целей. Планирование помогает контролировать расходы, увеличивать накопления и защищать от непредвиденных ситуаций.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Анализ ваших финансов',
      description: 'Персональные рекомендации на основе ваших данных',
      content: 'Наши алгоритмы анализируют ваши доходы, расходы и цели, чтобы предложить оптимальную стратегию достижения финансовой независимости.',
      gradient: 'from-violet-500 to-fuchsia-500',
    },
    {
      icon: DollarSign,
      title: 'Выберите вашу валюту',
      description: 'В какой валюте вы будете вести учет?',
      content: 'Выберите основную валюту для отображения всех финансовых данных. Вы сможете изменить это позже в настройках.',
      gradient: 'from-amber-500 to-orange-500',
      isCurrencySelector: true,
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_settings')
          .update({ currency: selectedCurrency, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_settings')
          .insert({ user_id: userId, currency: selectedCurrency });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-registration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            email: user.email,
            currency: selectedCurrency,
            created_at: user.created_at,
          }),
        }).catch(err => console.error('Failed to send notification:', err));
      }

      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = async () => {
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from('user_settings')
        .insert({ user_id: userId, currency: selectedCurrency });
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className={`bg-gradient-to-br ${currentSlideData.gradient} p-8 sm:p-12 text-white`}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Icon size={32} className="sm:w-10 sm:h-10" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">
              {currentSlideData.title}
            </h2>
            <p className="text-base sm:text-lg text-center text-white/90">
              {currentSlideData.description}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 sm:mb-8">
              {currentSlideData.content}
            </p>

            {currentSlideData.isCurrencySelector && (
              <div className="mb-6 sm:mb-8 max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                  {CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setSelectedCurrency(currency.code)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        selectedCurrency === currency.code
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-slate-900">{currency.name}</div>
                        <div className="text-sm text-slate-600">{currency.code}</div>
                      </div>
                      <div className="text-2xl">{currency.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-emerald-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all ${
                  currentSlide === 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Назад</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-sm sm:text-base">
                  {currentSlide === slides.length - 1 ? 'Начать' : 'Далее'}
                </span>
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {currentSlide === 0 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Пропустить презентацию
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
