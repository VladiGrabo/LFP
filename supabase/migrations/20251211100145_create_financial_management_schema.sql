/*
  # Financial Management System Schema

  ## Overview
  This migration creates a comprehensive personal finance management system with support for tracking goals, income, expenses, and assets.

  ## New Tables

  ### 1. `financial_goals`
  Stores user financial goals with target amounts and deadlines
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `title` (text) - Goal name
  - `description` (text) - Detailed description
  - `target_amount` (decimal) - Target amount to achieve
  - `current_amount` (decimal) - Current progress
  - `deadline` (date) - Target completion date
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `income`
  Tracks all income sources and transactions
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `source` (text) - Income source name
  - `amount` (decimal) - Income amount
  - `category` (text) - Income category (salary, freelance, investment, etc.)
  - `date` (date) - Income date
  - `description` (text) - Additional notes
  - `is_recurring` (boolean) - Whether this is recurring income
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `expenses`
  Tracks all expenses and spending
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `title` (text) - Expense name
  - `amount` (decimal) - Expense amount
  - `category` (text) - Expense category (food, transport, entertainment, etc.)
  - `date` (date) - Expense date
  - `description` (text) - Additional notes
  - `is_recurring` (boolean) - Whether this is recurring expense
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `assets`
  Stores user assets (property, investments, savings, etc.)
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Asset name
  - `type` (text) - Asset type (property, investment, savings, etc.)
  - `value` (decimal) - Current asset value
  - `description` (text) - Additional details
  - `purchase_date` (date) - When asset was acquired
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own financial data
  - Separate policies for SELECT, INSERT, UPDATE, and DELETE operations
  - All policies require authentication

  ### Important Notes
  1. All financial amounts use decimal type for precision
  2. All tables reference auth.users for user identification
  3. Timestamps are automatically set and updated
  4. RLS policies ensure complete data isolation between users
*/

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  target_amount decimal(12,2) NOT NULL,
  current_amount decimal(12,2) DEFAULT 0,
  deadline date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL,
  amount decimal(12,2) NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  description text DEFAULT '',
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount decimal(12,2) NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  description text DEFAULT '',
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  value decimal(12,2) NOT NULL,
  description text DEFAULT '',
  purchase_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Financial Goals Policies
CREATE POLICY "Users can view own goals"
  ON financial_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON financial_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON financial_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON financial_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Income Policies
CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Assets Policies
CREATE POLICY "Users can view own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
