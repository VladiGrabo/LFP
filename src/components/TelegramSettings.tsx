import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TelegramSettingsProps {
  userId: string;
}

export default function TelegramSettings({ userId }: TelegramSettingsProps) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<'pending' | 'set' | 'error'>('pending');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('telegram_bot_token, telegram_chat_id, telegram_notifications_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setBotToken(data.telegram_bot_token || '');
      setChatId(data.telegram_chat_id || '');
      setNotificationsEnabled(data.telegram_notifications_enabled || false);
    }
  };

  const setupWebhook = async (token: string) => {
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook`;
      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      });

      const result = await response.json();

      if (result.ok) {
        setWebhookStatus('set');
        return true;
      } else {
        setWebhookStatus('error');
        setMessage({ type: 'error', text: `Ошибка webhook: ${result.description}` });
        return false;
      }
    } catch (error) {
      setWebhookStatus('error');
      setMessage({ type: 'error', text: 'Не удалось установить webhook' });
      return false;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!botToken.trim()) {
        setMessage({ type: 'error', text: 'Введите Bot Token' });
        setLoading(false);
        return;
      }

      const webhookSet = await setupWebhook(botToken);
      if (!webhookSet) {
        setLoading(false);
        return;
      }

      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSettings) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            telegram_bot_token: botToken,
            telegram_chat_id: chatId || null,
            telegram_notifications_enabled: notificationsEnabled,
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            telegram_bot_token: botToken,
            telegram_chat_id: chatId || null,
            telegram_notifications_enabled: notificationsEnabled,
          });

        if (error) throw error;
      }

      setMessage({
        type: 'success',
        text: 'Настройки сохранены! Теперь можно отправить тестовое уведомление',
      });

      await loadSettings();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!botToken || !chatId) {
      setMessage({ type: 'error', text: 'Настройте бота и получите Chat ID' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Тестовое уведомление от FinancePlan!\n\nВаши уведомления настроены правильно.',
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setMessage({ type: 'success', text: 'Тестовое уведомление отправлено!' });
      } else {
        setMessage({ type: 'error', text: `Ошибка: ${result.description}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Telegram уведомления</h2>
        <p className="text-slate-600">
          Получайте уведомления о финансовых целях и рекомендации прямо в Telegram
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Как настроить:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Откройте Telegram и найдите <strong>@BotFather</strong></li>
              <li>Отправьте команду <code className="bg-blue-100 px-1 rounded">/newbot</code> для создания бота</li>
              <li>Получите <strong>Bot Token</strong> и вставьте его выше</li>
              <li><strong>Для канала:</strong> Добавьте бота в канал как администратора с правами публикации</li>
              <li><strong>Для канала:</strong> Вставьте ID канала (например: 3219720203)</li>
              <li>Сохраните настройки и отправьте тестовое уведомление</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bot Token
          </label>
          <input
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="1234567890:AAEk_PQjZ3k52lYTvGADf4k3vUUZ9sdk6gY"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Chat ID или ID канала
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="3219720203 или -1001234567890"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Для канала: добавьте бота как администратора и укажите ID канала
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="notifications"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="notifications" className="text-sm font-medium text-slate-700">
            Включить уведомления
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 transition-colors"
        >
          <Send size={18} />
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>

        {chatId && (
          <button
            onClick={sendTestNotification}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            <Send size={18} />
            Тест
          </button>
        )}
      </div>
    </div>
  );
}
