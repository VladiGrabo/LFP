/*
  # Add Bank Statements Table

  1. New Tables
    - `bank_statements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text) - original filename
      - `file_content` (text) - content of the uploaded file
      - `status` (text) - processing status: 'pending', 'processing', 'completed', 'error'
      - `transactions_extracted` (integer) - number of transactions found
      - `error_message` (text, nullable) - error details if processing failed
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `bank_statements` table
    - Add policy for users to manage their own statements
*/

CREATE TABLE IF NOT EXISTS bank_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  file_content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transactions_extracted integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank statements"
  ON bank_statements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank statements"
  ON bank_statements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank statements"
  ON bank_statements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank statements"
  ON bank_statements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
