-- ============================================
-- MIGRATION 008: CREATE APP TABLES
-- ============================================

-- 0. CREATE UPDATE_UPDATED_AT_COLUMN FUNCTION (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. ADD NEW FIELDS TO PROFILES TABLE
-- ============================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS super_tutor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spoken_languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_proficiency JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS taught_languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proficiency_taught_lan JSONB DEFAULT '{}';

-- 2. CREATE TUTOR_STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL UNIQUE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_students INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_tutor_stats_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- 3. CREATE LANGUAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  CONSTRAINT unique_language_name_code UNIQUE (name, code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the specified languages
INSERT INTO languages (name, code) VALUES
  ('Baoulé', 'baoule'),
  ('Bété', 'bete'),
  ('Dioula', 'dioula'),
  ('Bambara', 'bambara'),
  ('Agni', 'agni'),
  ('Senoufo', 'senoufo'),
  ('Swahili', 'swahili'),
  ('Wolof', 'wolof'),
  ('Lingala', 'lingala'),
  ('Fon', 'fon')
ON CONFLICT (name, code) DO NOTHING;

-- 4. CREATE SUBSCRIPTION_PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  duration_months INTEGER NOT NULL,
  sessions_count INTEGER NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  price_fcfa INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the specified subscription plans
INSERT INTO subscription_plans (name, duration_months, sessions_count, session_duration_minutes, price_eur, price_fcfa) VALUES
  ('Monthly', 1, 4, 90, 80.00, 55000),
  ('Quarterly', 3, 12, 90, 74.00, 50000),
  ('Half-yearly', 6, 24, 90, 68.00, 45000)
ON CONFLICT (name) DO NOTHING;

-- 5. CREATE REVIEWS TABLE
-- ============================================


  
  CONSTRAINT fk_reviews_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_student_id 
    FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_tutor_student_review 
    UNIQUE (tutor_id, student_id)
);

-- 6. CREATE STUDENT_SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  language_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_sessions INTEGER NOT NULL,
  remaining_sessions INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_student_subscriptions_student_id 
    FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_subscriptions_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_subscriptions_language_id 
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_subscriptions_plan_id 
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- 7. CREATE TRIAL_LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trial_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_minutes INTEGER NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  price_fcfa INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the specified trial lessons
INSERT INTO trial_lessons (duration_minutes, price_eur, price_fcfa) VALUES
  (25, 7.5, 5000),
  (50, 15, 10000)
ON CONFLICT DO NOTHING;

-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tutor_stats_tutor_id ON tutor_stats(tutor_id);
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_reviews_tutor_id ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_student_id ON student_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_tutor_id ON student_subscriptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_status ON student_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_end_date ON student_subscriptions(end_date);

-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_tutor_stats_updated_at
  BEFORE UPDATE ON tutor_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_subscriptions_updated_at
  BEFORE UPDATE ON student_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE tutor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_lessons ENABLE ROW LEVEL SECURITY;

-- 11. CREATE RLS POLICIES
-- ============================================
-- Tutor stats policies
CREATE POLICY "Allow all operations on tutor_stats" ON tutor_stats
  FOR ALL USING (true);

-- Languages policies (read-only for all, admin can modify)
CREATE POLICY "Allow read access to languages" ON languages
  FOR SELECT USING (true);

-- Subscription plans policies (read-only for all, admin can modify)
CREATE POLICY "Allow read access to subscription_plans" ON subscription_plans
  FOR SELECT USING (true);

-- Reviews policies
CREATE POLICY "Allow all operations on reviews" ON reviews
  FOR ALL USING (true);

-- Student subscriptions policies
CREATE POLICY "Allow all operations on student_subscriptions" ON student_subscriptions
  FOR ALL USING (true);

-- Trial lessons policies (read-only for all, admin can modify)
CREATE POLICY "Allow read access to trial_lessons" ON trial_lessons
  FOR SELECT USING (true);

-- 12. CREATE FUNCTION TO UPDATE TUTOR STATS
-- ============================================
CREATE OR REPLACE FUNCTION update_tutor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tutor stats when a review is added/updated/deleted
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    INSERT INTO tutor_stats (tutor_id, total_reviews, average_rating)
    SELECT 
      tutor_id,
      COUNT(*) as total_reviews,
      ROUND(AVG(rating)::numeric, 2) as average_rating
    FROM reviews 
    WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
    GROUP BY tutor_id
    ON CONFLICT (tutor_id) 
    DO UPDATE SET 
      total_reviews = EXCLUDED.total_reviews,
      average_rating = EXCLUDED.average_rating,
      updated_at = NOW();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 13. CREATE TRIGGER FOR AUTO-UPDATING TUTOR STATS
-- ============================================
CREATE TRIGGER update_tutor_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_stats();

-- 14. CREATE FUNCTION TO VALIDATE SUBSCRIPTION DATES
-- ============================================
CREATE OR REPLACE FUNCTION validate_subscription_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure end_date is after start_date
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  -- Ensure remaining_sessions doesn't exceed total_sessions
  IF NEW.remaining_sessions > NEW.total_sessions THEN
    RAISE EXCEPTION 'Remaining sessions cannot exceed total sessions';
  END IF;
  
  -- Auto-update status based on end_date
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. CREATE TRIGGER FOR SUBSCRIPTION VALIDATION
-- ============================================
CREATE TRIGGER validate_subscription_dates_trigger
  BEFORE INSERT OR UPDATE ON student_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION validate_subscription_dates();

-- Create tutor_resume table
CREATE TABLE IF NOT EXISTS tutor_resume (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('education', 'work_experience', 'certification')),
    
    -- Education fields
    institution_name TEXT,
    field_of_study TEXT,
    degree_level TEXT,
    
    -- Work experience fields
    company_name TEXT,
    position TEXT,
    
    -- Certification fields
    certificate_name TEXT,
    issuing_organization TEXT,
    
    -- Common fields
    start_year INTEGER,
    end_year INTEGER,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_resume_tutor_id ON tutor_resume(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_resume_type ON tutor_resume(type);

-- Enable RLS
ALTER TABLE tutor_resume ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tutor_resume_updated_at 
    BEFORE UPDATE ON tutor_resume 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
