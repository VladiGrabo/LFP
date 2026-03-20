/*
  # Добавление триггера для уведомлений о регистрации
  
  1. Изменения
    - Создаем функцию для вызова Edge Function при новой регистрации
    - Добавляем триггер на таблицу user_settings
    - Триггер срабатывает после INSERT новой записи
  
  2. Функциональность
    - При создании нового пользователя (user_settings)
    - Вызывается Edge Function notify-new-registration
    - Отправляется уведомление в Telegram канал с данными пользователя
*/

-- Создаем функцию для отправки уведомления о регистрации
CREATE OR REPLACE FUNCTION notify_registration()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  bot_token TEXT;
  chat_id TEXT;
BEGIN
  -- Получаем email пользователя из auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Получаем настройки Telegram из первой записи с заполненным bot_token
  SELECT telegram_bot_token, telegram_chat_id INTO bot_token, chat_id
  FROM user_settings
  WHERE telegram_bot_token IS NOT NULL 
    AND telegram_chat_id IS NOT NULL
  LIMIT 1;

  -- Если настройки найдены, вызываем Edge Function
  IF bot_token IS NOT NULL AND chat_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := (SELECT (current_setting('app.settings.api_url', true) || '/functions/v1/notify-new-registration')),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.service_role_key', true))
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id::text,
        'email', COALESCE(user_email, 'N/A'),
        'created_at', NEW.created_at,
        'currency', NEW.currency,
        'bot_token', bot_token,
        'chat_id', chat_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер на таблицу user_settings
DROP TRIGGER IF EXISTS on_user_registration ON user_settings;

CREATE TRIGGER on_user_registration
  AFTER INSERT ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION notify_registration();
