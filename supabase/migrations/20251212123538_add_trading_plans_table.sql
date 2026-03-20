/*
  # Создание таблицы торговых планов

  1. Новые таблицы
    - `trading_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_name` (text) - название плана
      - `initial_capital` (numeric) - начальный капитал
      - `monthly_deposit` (numeric) - ежемесячное пополнение
      - `annual_return` (numeric) - годовая доходность в %
      - `investment_period` (integer) - период инвестирования в месяцах
      - `risk_level` (text) - уровень риска (low, medium, high)
      - `description` (text) - описание плана
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Безопасность
    - Включить RLS для таблицы `trading_plans`
    - Политики для CRUD операций только для владельца
*/

CREATE TABLE IF NOT EXISTS trading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name text NOT NULL,
  initial_capital numeric DEFAULT 0,
  monthly_deposit numeric DEFAULT 0,
  annual_return numeric DEFAULT 0,
  investment_period integer DEFAULT 12,
  risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trading plans"
  ON trading_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trading plans"
  ON trading_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading plans"
  ON trading_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trading plans"
  ON trading_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Создать индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_trading_plans_user_id ON trading_plans(user_id);