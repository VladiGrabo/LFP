/*
  # Add Telegram Integration to User Settings

  1. Changes
    - Add `telegram_bot_token` column to `user_settings` table
      - Stores the Telegram Bot API token for sending notifications
      - Optional field (can be null)
    - Add `telegram_chat_id` column to `user_settings` table
      - Stores the user's Telegram Chat ID
      - Automatically populated when user sends /start to the bot
      - Optional field (can be null)
    - Add `telegram_notifications_enabled` column to `user_settings` table
      - Boolean flag to enable/disable Telegram notifications
      - Default is false
  
  2. Security
    - Existing RLS policies already cover these new columns
    - Bot token is encrypted at rest by Supabase
  
  3. Notes
    - Bot token is obtained from @BotFather in Telegram
    - Chat ID is automatically captured via webhook when user messages the bot
    - Notifications are only sent if both token and chat_id are present and notifications are enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_bot_token'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_bot_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_chat_id'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_chat_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_notifications_enabled'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_notifications_enabled boolean DEFAULT false;
  END IF;
END $$;