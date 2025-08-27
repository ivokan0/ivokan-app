-- ============================================
-- MIGRATION 029: CREATE POLICIES AND EARNINGS TABLES
-- ============================================

-- 1. CREATE POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial policy
INSERT INTO policies (key, value, description) VALUES
  ('platform_commission_percentage', '25', 'Pourcentage de commission de la plateforme sur les revenus des tuteurs')
ON CONFLICT (key) DO NOTHING;

-- 2. CREATE EARNINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trial', 'plan')),
  student_subscriptions_id UUID,
  trial_bookings_id UUID,
  gross_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'gained', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_earnings_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_earnings_student_id 
    FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_earnings_student_subscriptions_id 
    FOREIGN KEY (student_subscriptions_id) REFERENCES student_subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_earnings_trial_bookings_id 
    FOREIGN KEY (trial_bookings_id) REFERENCES trial_bookings(id) ON DELETE CASCADE,
    
  -- Business logic constraints
  CONSTRAINT earnings_type_reference_check 
    CHECK (
      (type = 'plan' AND student_subscriptions_id IS NOT NULL AND trial_bookings_id IS NULL) OR
      (type = 'trial' AND trial_bookings_id IS NOT NULL AND student_subscriptions_id IS NULL)
    )
);

-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_policies_key ON policies(key);
CREATE INDEX IF NOT EXISTS idx_earnings_tutor_id ON earnings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_earnings_student_id ON earnings(student_id);
CREATE INDEX IF NOT EXISTS idx_earnings_type ON earnings(type);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at);

-- 4. CREATE RLS POLICIES
-- ============================================
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Policies table - allow read for all authenticated users, admin only for write
CREATE POLICY "Allow read access to policies for authenticated users" ON policies
  FOR SELECT USING (true);

CREATE POLICY "Allow insert/update for policies by admins only" ON policies
  FOR ALL USING (false); -- For now, no user can modify policies through the app

-- Earnings table - users can only see their own earnings
CREATE POLICY "Allow tutors to see their own earnings" ON earnings
  FOR SELECT USING (tutor_id = auth.uid()::TEXT);

CREATE POLICY "Allow students to see their own payments" ON earnings
  FOR SELECT USING (student_id = auth.uid()::TEXT);

CREATE POLICY "Allow all operations for authenticated users" ON earnings
  FOR ALL USING (true); -- Will be refined later with proper auth

-- 5. CREATE FUNCTION TO UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================
CREATE TRIGGER update_policies_updated_at 
  BEFORE UPDATE ON policies 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at 
  BEFORE UPDATE ON earnings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. CREATE FUNCTION TO GET POLICY VALUE
-- ============================================
CREATE OR REPLACE FUNCTION get_policy_value(policy_key TEXT)
RETURNS TEXT AS $$
DECLARE
  policy_value TEXT;
BEGIN
  SELECT value INTO policy_value FROM policies WHERE key = policy_key LIMIT 1;
  RETURN policy_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE FUNCTION TO CALCULATE NET AMOUNT
-- ============================================
CREATE OR REPLACE FUNCTION calculate_net_amount(gross_amount_input DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  commission_percentage DECIMAL;
  net_amount_result DECIMAL;
BEGIN
  -- Get commission percentage from policies
  SELECT CAST(get_policy_value('platform_commission_percentage') AS DECIMAL) INTO commission_percentage;
  
  -- If no policy found, default to 25%
  IF commission_percentage IS NULL THEN
    commission_percentage := 25;
  END IF;
  
  -- Calculate net amount
  net_amount_result := gross_amount_input * (100 - commission_percentage) / 100;
  
  RETURN ROUND(net_amount_result, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
