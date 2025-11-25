-- Payments & Transactions Schema for AdMarket

-- ============================================================================
-- USER BALANCES TABLE
-- ============================================================================
-- Хранит балансы пользователей

CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('advertiser', 'creator')),
  
  -- Balance (in cents/kopeks for precision)
  balance_cents BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  
  -- Held balance (reserved for pending transactions)
  held_balance_cents BIGINT DEFAULT 0,
  
  -- Available balance (balance - held)
  available_balance_cents BIGINT GENERATED ALWAYS AS (balance_cents - held_balance_cents) STORED,
  
  -- Lifetime statistics
  total_earned_cents BIGINT DEFAULT 0,
  total_spent_cents BIGINT DEFAULT 0,
  total_withdrawn_cents BIGINT DEFAULT 0,
  total_deposited_cents BIGINT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_balances_user ON user_balances(user_id);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Хранит все финансовые транзакции

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('advertiser', 'creator')),
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN (
    'deposit',           -- Пополнение баланса
    'withdrawal',        -- Вывод средств
    'placement_hold',    -- Резервирование средств для размещения
    'placement_release', -- Освобождение зарезервированных средств
    'placement_payment', -- Оплата размещения
    'placement_refund',  -- Возврат средств за размещение
    'fee',              -- Комиссия платформы
    'bonus',            -- Бонус от платформы
    'adjustment'        -- Корректировка баланса
  )),
  
  -- Amount (in cents/kopeks)
  amount_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'RUB',
  
  -- Related entities
  placement_id UUID,
  campaign_id UUID,
  
  -- Transaction status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Payment method / provider
  payment_method TEXT, -- 'card', 'bank_transfer', 'stripe', 'paypal', etc.
  payment_provider TEXT,
  provider_transaction_id TEXT,
  
  -- Description
  description TEXT,
  
  -- Metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Foreign keys
  FOREIGN KEY (placement_id) REFERENCES placements(id) ON DELETE SET NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_placement ON transactions(placement_id);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign ON transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================
-- Хранит методы оплаты пользователей

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL,
  
  -- Method details
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'stripe')),
  provider TEXT NOT NULL,
  provider_payment_method_id TEXT, -- ID в платёжной системе
  
  -- Card details (if applicable)
  last4 TEXT,
  card_brand TEXT, -- visa, mastercard, etc.
  exp_month INT,
  exp_year INT,
  
  -- Bank account details (if applicable)
  bank_name TEXT,
  account_number_last4 TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update user balance when transaction is completed
CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update balance based on transaction type
    CASE NEW.type
      WHEN 'deposit', 'placement_payment', 'bonus', 'placement_refund' THEN
        UPDATE user_balances
        SET 
          balance_cents = balance_cents + NEW.amount_cents,
          total_deposited_cents = CASE WHEN NEW.type = 'deposit' THEN total_deposited_cents + NEW.amount_cents ELSE total_deposited_cents END,
          total_earned_cents = CASE WHEN NEW.type = 'placement_payment' THEN total_earned_cents + NEW.amount_cents ELSE total_earned_cents END,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'withdrawal', 'fee', 'placement_hold' THEN
        UPDATE user_balances
        SET 
          balance_cents = balance_cents - NEW.amount_cents,
          held_balance_cents = CASE WHEN NEW.type = 'placement_hold' THEN held_balance_cents + NEW.amount_cents ELSE held_balance_cents END,
          total_withdrawn_cents = CASE WHEN NEW.type = 'withdrawal' THEN total_withdrawn_cents + NEW.amount_cents ELSE total_withdrawn_cents END,
          total_spent_cents = CASE WHEN NEW.type NOT IN ('placement_hold') THEN total_spent_cents + NEW.amount_cents ELSE total_spent_cents END,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'placement_release' THEN
        UPDATE user_balances
        SET 
          held_balance_cents = held_balance_cents - NEW.amount_cents,
          total_spent_cents = total_spent_cents + NEW.amount_cents,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'adjustment' THEN
        UPDATE user_balances
        SET 
          balance_cents = balance_cents + NEW.amount_cents,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END CASE;
    
    -- Set completed_at timestamp
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balance_on_transaction
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance_on_transaction();

-- Trigger: Update updated_at timestamp
CREATE TRIGGER trigger_user_balances_updated_at
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- User balances: Users can only view their own balance
CREATE POLICY user_balances_select_policy ON user_balances
  FOR SELECT
  USING (auth.uid() = user_id);

-- User balances: Only system can update
CREATE POLICY user_balances_update_policy ON user_balances
  FOR UPDATE
  USING (false);

-- Transactions: Users can view their own transactions
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Transactions: Users can create deposit/withdrawal transactions
CREATE POLICY transactions_insert_policy ON transactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    type IN ('deposit', 'withdrawal')
  );

-- Payment methods: Users can view their own payment methods
CREATE POLICY payment_methods_select_policy ON payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

-- Payment methods: Users can manage their own payment methods
CREATE POLICY payment_methods_insert_policy ON payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY payment_methods_update_policy ON payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY payment_methods_delete_policy ON payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to initialize user balance
CREATE OR REPLACE FUNCTION initialize_user_balance(p_user_id UUID, p_user_type TEXT)
RETURNS UUID AS $$
DECLARE
  v_balance_id UUID;
BEGIN
  INSERT INTO user_balances (user_id, user_type)
  VALUES (p_user_id, p_user_type)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_balance_id;
  
  RETURN v_balance_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create transaction
CREATE OR REPLACE FUNCTION create_transaction(
  p_user_id UUID,
  p_user_type TEXT,
  p_type TEXT,
  p_amount_cents BIGINT,
  p_description TEXT DEFAULT NULL,
  p_placement_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO transactions (
    user_id,
    user_type,
    type,
    amount_cents,
    description,
    placement_id,
    campaign_id,
    status
  )
  VALUES (
    p_user_id,
    p_user_type,
    p_type,
    p_amount_cents,
    p_description,
    p_placement_id,
    p_campaign_id,
    'pending'
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Initialize balance for test user:
-- SELECT initialize_user_balance('bf91c23b-7b52-4870-82f7-ba9ad852b49e', 'advertiser');

-- Create test deposit:
-- INSERT INTO transactions (user_id, user_type, type, amount_cents, status, description)
-- VALUES (
--   'bf91c23b-7b52-4870-82f7-ba9ad852b49e',
--   'advertiser',
--   'deposit',
--   10000000, -- 100,000 RUB
--   'completed',
--   'Пополнение баланса'
-- );

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get user balance:
-- SELECT 
--   balance_cents / 100.0 as balance,
--   held_balance_cents / 100.0 as held_balance,
--   available_balance_cents / 100.0 as available_balance,
--   currency
-- FROM user_balances
-- WHERE user_id = 'user-id';

-- Get transaction history:
-- SELECT 
--   id,
--   type,
--   amount_cents / 100.0 as amount,
--   currency,
--   status,
--   description,
--   created_at
-- FROM transactions
-- WHERE user_id = 'user-id'
-- ORDER BY created_at DESC;

-- Get balance summary:
-- SELECT 
--   (balance_cents / 100.0) as current_balance,
--   (total_earned_cents / 100.0) as lifetime_earned,
--   (total_spent_cents / 100.0) as lifetime_spent,
--   (total_deposited_cents / 100.0) as lifetime_deposited,
--   (total_withdrawn_cents / 100.0) as lifetime_withdrawn
-- FROM user_balances
-- WHERE user_id = 'user-id';
