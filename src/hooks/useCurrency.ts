import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCurrency(userId: string | undefined) {
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadCurrency();
  }, [userId]);

  const loadCurrency = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('user_settings')
      .select('currency')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setCurrency(data.currency);
    }
    setLoading(false);
  };

  const updateCurrency = async (newCurrency: string) => {
    if (!userId) return;

    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_settings')
        .update({ currency: newCurrency, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_settings')
        .insert({ user_id: userId, currency: newCurrency });
    }

    setCurrency(newCurrency);
  };

  return { currency, loading, updateCurrency };
}
