-- ============================================
-- MIGRATION 031: CREATE WITHDRAWAL SYSTEM
-- ============================================

-- 1. CREATE PAYMENT_PROOFS BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. ADD BALANCE COLUMN TO EARNINGS TABLE
-- ============================================
ALTER TABLE earnings ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0;

-- 3. CREATE WITHDRAWAL_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'rejected')),
  notes TEXT,
  payment_proof_url TEXT,
  payment_proof_uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_withdrawal_requests_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_withdrawal_requests_payment_method_id 
    FOREIGN KEY (payment_method_id) REFERENCES tutor_payment_methods(id) ON DELETE CASCADE
);

-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_tutor_id ON withdrawal_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_earnings_balance ON earnings(balance);

-- 5. CREATE RLS POLICIES
-- ============================================
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own withdrawal requests
CREATE POLICY "Allow users to see their own withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (tutor_id = auth.uid()::TEXT);

CREATE POLICY "Allow users to create their own withdrawal requests" ON withdrawal_requests
  FOR INSERT WITH CHECK (tutor_id = auth.uid()::TEXT);

CREATE POLICY "Allow users to update their own withdrawal requests" ON withdrawal_requests
  FOR UPDATE USING (tutor_id = auth.uid()::TEXT);

-- 6. CREATE FUNCTION TO UPDATE BALANCE ON EARNINGS STATUS CHANGE
-- ============================================
CREATE OR REPLACE FUNCTION update_earnings_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'gained', add net_amount to balance
  IF NEW.status = 'gained' AND (OLD.status IS NULL OR OLD.status != 'gained') THEN
    NEW.balance = COALESCE(OLD.balance, 0) + NEW.net_amount;
  -- If status changed from 'gained' to something else, subtract net_amount from balance
  ELSIF OLD.status = 'gained' AND NEW.status != 'gained' THEN
    NEW.balance = COALESCE(OLD.balance, 0) - OLD.net_amount;
  -- If status changed to 'gained' from something else, add net_amount to balance
  ELSIF OLD.status != 'gained' AND NEW.status = 'gained' THEN
    NEW.balance = COALESCE(OLD.balance, 0) + NEW.net_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREATE TRIGGER FOR AUTOMATIC BALANCE UPDATES
-- ============================================
CREATE TRIGGER update_earnings_balance_trigger
  BEFORE UPDATE ON earnings
  FOR EACH ROW EXECUTE PROCEDURE update_earnings_balance();

-- 8. CREATE FUNCTION TO UPDATE BALANCE ON WITHDRAWAL STATUS CHANGE
-- ============================================
CREATE OR REPLACE FUNCTION update_balance_on_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- If withdrawal status changed to 'pending' or 'done', deduct amount from balance
  IF NEW.status IN ('pending', 'done') AND (OLD.status IS NULL OR OLD.status NOT IN ('pending', 'done')) THEN
    UPDATE earnings 
    SET balance = balance - NEW.amount 
    WHERE tutor_id = NEW.tutor_id;
  -- If withdrawal status changed from 'pending' or 'done' to 'rejected', restore amount to balance
  ELSIF OLD.status IN ('pending', 'done') AND NEW.status = 'rejected' THEN
    UPDATE earnings 
    SET balance = balance + OLD.amount 
    WHERE tutor_id = NEW.tutor_id;
  -- If withdrawal status changed from 'rejected' to 'pending' or 'done', deduct amount from balance
  ELSIF OLD.status = 'rejected' AND NEW.status IN ('pending', 'done') THEN
    UPDATE earnings 
    SET balance = balance - NEW.amount 
    WHERE tutor_id = NEW.tutor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE TRIGGER FOR AUTOMATIC BALANCE UPDATES ON WITHDRAWAL STATUS CHANGE
-- ============================================
CREATE TRIGGER update_balance_on_withdrawal_trigger
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE PROCEDURE update_balance_on_withdrawal();

-- 10. CREATE TRIGGER FOR AUTOMATIC BALANCE UPDATES ON WITHDRAWAL INSERT
-- ============================================
CREATE OR REPLACE FUNCTION update_balance_on_withdrawal_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If withdrawal is created with 'pending' or 'done' status, deduct amount from balance
  IF NEW.status IN ('pending', 'done') THEN
    UPDATE earnings 
    SET balance = balance - NEW.amount 
    WHERE tutor_id = NEW.tutor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_balance_on_withdrawal_insert_trigger
  BEFORE INSERT ON withdrawal_requests
  FOR EACH ROW EXECUTE PROCEDURE update_balance_on_withdrawal_insert();

-- 11. CREATE TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================
CREATE TRIGGER update_withdrawal_requests_updated_at 
  BEFORE UPDATE ON withdrawal_requests 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 12. INITIALIZE BALANCE FOR EXISTING EARNINGS
-- ============================================
UPDATE earnings 
SET balance = net_amount 
WHERE status = 'gained' AND balance IS NULL OR balance = 0;
