-- Create a table to store push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL,
  pushToken TEXT NOT NULL,
  device TEXT,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(userId, pushToken)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(userId);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(pushToken);

-- Add RLS (Row Level Security) policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own push tokens
CREATE POLICY "Users can view their own push tokens"
  ON push_tokens
  FOR SELECT
  USING (auth.uid()::text = userId);

-- Allow the service to insert/update push tokens
CREATE POLICY "Service can manage all push tokens"
  ON push_tokens
  FOR ALL
  USING (auth.role() = 'service_role'); 