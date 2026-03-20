/*
  # Исправление триггера для уведомлений о регистрации
  
  1. Изменения
    - Используем pg_net вместо http расширения
    - Edge Function сама получит токен и chat_id из базы
    - Упрощаем передачу данных
*/

-- Удаляем старую функцию
DROP TRIGGER IF EXISTS on_user_registration ON user_settings;
DROP FUNCTION IF EXISTS notify_registration();

-- Создаем новую функцию с использованием pg_net
CREATE OR REPLACE FUNCTION notify_registration()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Получаем email пользователя из auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Формируем URL для Edge Function
  -- В Supabase эти значения доступны через переменные окружения
  function_url := current_setting('request.headers', true)::json->>'x-forwarded-host';
  
  IF function_url IS NULL OR function_url = '' THEN
    -- Используем стандартный URL проекта
    function_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1/notify-new-registration';
  ELSE
    function_url := 'https://' || function_url || '/functions/v1/notify-new-registration';
  END IF;

  -- Пытаемся получить service role key из настроек
  BEGIN
    service_role_key := current_setting('app.settings.service_role_key', false);
  EXCEPTION WHEN OTHERS THEN
    service_role_key := '';
  END;

  -- Вызываем Edge Function асинхронно через pg_net
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id::text,
      'email', COALESCE(user_email, 'N/A'),
      'created_at', NEW.created_at::text,
      'currency', NEW.currency
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Логируем ошибку но не прерываем регистрацию
  RAISE WARNING 'Failed to send registration notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер на таблицу user_settings
CREATE TRIGGER on_user_registration
  AFTER INSERT ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION notify_registration();
