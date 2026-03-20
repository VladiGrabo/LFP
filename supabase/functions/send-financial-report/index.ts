import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FinancialData {
  userId: string;
  userEmail: string;
  totalIncome: number;
  totalExpenses: number;
  totalAssets: number;
  netWorth: number;
  savingsRate: number;
  financialHealth: string;
  healthColor: string;
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: FinancialData = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings } = await supabase
      .from('user_settings')
      .select('telegram_bot_token, telegram_chat_id, telegram_notifications_enabled')
      .eq('user_id', data.userId)
      .maybeSingle();

    if (!settings?.telegram_bot_token || !settings?.telegram_chat_id || !settings?.telegram_notifications_enabled) {
      return new Response(
        JSON.stringify({ error: 'Telegram не настроен или уведомления отключены' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;

    const healthEmoji = data.healthColor === 'green' ? '🟢' : 
                       data.healthColor === 'lightgreen' ? '🟢' :
                       data.healthColor === 'yellow' ? '🟡' :
                       data.healthColor === 'orange' ? '🟠' : '🔴';

    let message = `${healthEmoji} <b>Финансовый отчёт</b>\n\n`;
    message += `👤 Пользователь: ${data.userEmail}\n`;
    message += `📊 <b>Финансовое здоровье: ${data.financialHealth}</b>\n\n`;
    
    message += `💰 <b>Основные показатели:</b>\n`;
    message += `• Чистый капитал: £${data.netWorth.toLocaleString('en-GB')}\n`;
    message += `• Месячный доход: £${data.totalIncome.toLocaleString('en-GB')}\n`;
    message += `• Месячные расходы: £${data.totalExpenses.toLocaleString('en-GB')}\n`;
    message += `• Всего активов: £${data.totalAssets.toLocaleString('en-GB')}\n`;
    message += `• Норма сбережений: ${data.savingsRate.toFixed(1)}%\n\n`;

    if (data.recommendations && data.recommendations.length > 0) {
      message += `📋 <b>Рекомендации:</b>\n`;
      data.recommendations.slice(0, 5).forEach((rec, index) => {
        message += `${index + 1}. ${rec}\n`;
      });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      return new Response(
        JSON.stringify({ error: telegramResult.description }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Отчёт отправлен в канал' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});