CREATE TABLE code_refining_conversations (
  id SERIAL PRIMARY KEY,
  ship_id text UNIQUE REFERENCES ships(slug),
  messages JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes as needed
CREATE INDEX idx_code_refining_conversations_ship_id ON code_refining_conversations(ship_id);
