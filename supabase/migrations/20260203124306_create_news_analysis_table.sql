/*
  # Create News Analysis Table

  1. New Tables
    - `news_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `article_text` (text) - The news article text that was analyzed
      - `result` (text) - The classification result (fake, real, or uncertain)
      - `confidence_score` (decimal) - Confidence score from 0 to 1
      - `reasoning` (text) - AI reasoning for the classification
      - `created_at` (timestamptz) - Timestamp of when the analysis was performed
      - `ip_address` (text) - IP address of the user (for rate limiting)
  
  2. Security
    - Enable RLS on `news_analyses` table
    - Add policy for anyone to insert their own analyses
    - Add policy for anyone to read all analyses (public data)
  
  3. Indexes
    - Add index on created_at for efficient querying of recent analyses
*/

CREATE TABLE IF NOT EXISTS news_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_text text NOT NULL,
  result text NOT NULL,
  confidence_score decimal(3,2) NOT NULL,
  reasoning text NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE news_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analyses"
  ON news_analyses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view analyses"
  ON news_analyses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_news_analyses_created_at ON news_analyses(created_at DESC);