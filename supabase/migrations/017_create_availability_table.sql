-- ============================================
-- MIGRATION 017: CREATE AVAILABILITY TABLE
-- ============================================

-- 1. CREATE AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly_availability', 'unavailability')),
  
  -- Weekly availability fields
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  
  -- Unavailability fields
  start_date DATE,
  end_date DATE,
  is_full_day BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_tutor_availability_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
    
  -- Constraints for weekly availability
  CONSTRAINT weekly_availability_check 
    CHECK (
      (type = 'weekly_availability' AND day_of_week IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_date IS NULL AND end_date IS NULL AND is_full_day IS NULL) OR
      (type = 'unavailability' AND start_date IS NOT NULL AND end_date IS NOT NULL AND is_full_day IS NOT NULL AND day_of_week IS NULL AND (is_full_day = true OR (start_time IS NOT NULL AND end_time IS NOT NULL)))
    ),
    
  -- Time validation
  CONSTRAINT time_order_check 
    CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time),
    
  -- Date validation  
  CONSTRAINT date_order_check 
    CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_id ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_type ON tutor_availability(type);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_day_of_week ON tutor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_dates ON tutor_availability(start_date, end_date);

-- 3. CREATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_tutor_availability_updated_at
  BEFORE UPDATE ON tutor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. DISABLE ROW LEVEL SECURITY
-- ============================================
-- Note: Since we're using Clerk authentication and not Supabase auth,
-- auth.uid() will not work. We handle authorization in the application layer.
ALTER TABLE tutor_availability DISABLE ROW LEVEL SECURITY;

-- 5. CREATE VIEW FOR TUTOR AVAILABILITIES (TODAY + 2 WEEKS)
-- ============================================
CREATE OR REPLACE VIEW tutor_availability_view AS
WITH date_range AS (
  SELECT 
    CURRENT_DATE as start_date,
    CURRENT_DATE + INTERVAL '14 days' as end_date
),
expanded_weekly AS (
  -- Expand weekly availability for the next 2 weeks
  SELECT 
    ta.tutor_id,
    ta.type,
    d.date_actual,
    EXTRACT(DOW FROM d.date_actual)::INTEGER as day_of_week,
    ta.start_time,
    ta.end_time,
    NULL::DATE as unavailable_start_date,
    NULL::DATE as unavailable_end_date,
    NULL::BOOLEAN as is_full_day,
    ta.id as availability_id
  FROM tutor_availability ta
  CROSS JOIN date_range dr
  CROSS JOIN LATERAL (
    SELECT generate_series(dr.start_date, dr.end_date, '1 day'::interval)::DATE as date_actual
  ) d
  WHERE ta.type = 'weekly_availability'
    AND EXTRACT(DOW FROM d.date_actual)::INTEGER = ta.day_of_week
),
unavailability_periods AS (
  -- Get unavailability periods that overlap with our date range
  SELECT 
    ta.tutor_id,
    ta.type,
    d.date_actual,
    NULL::INTEGER as day_of_week,
    CASE WHEN ta.is_full_day THEN NULL ELSE ta.start_time END as start_time,
    CASE WHEN ta.is_full_day THEN NULL ELSE ta.end_time END as end_time,
    ta.start_date as unavailable_start_date,
    ta.end_date as unavailable_end_date,
    ta.is_full_day,
    ta.id as availability_id
  FROM tutor_availability ta
  CROSS JOIN date_range dr
  CROSS JOIN LATERAL (
    SELECT generate_series(
      GREATEST(ta.start_date, dr.start_date),
      LEAST(ta.end_date, dr.end_date),
      '1 day'::interval
    )::DATE as date_actual
  ) d
  WHERE ta.type = 'unavailability'
    AND ta.start_date <= dr.end_date
    AND ta.end_date >= dr.start_date
)
SELECT 
  tutor_id,
  type,
  date_actual,
  day_of_week,
  start_time,
  end_time,
  unavailable_start_date,
  unavailable_end_date,
  is_full_day,
  availability_id,
  -- Helper fields
  CASE 
    WHEN type = 'weekly_availability' THEN 'available'
    WHEN type = 'unavailability' AND is_full_day THEN 'unavailable_full_day'
    WHEN type = 'unavailability' AND NOT is_full_day THEN 'unavailable_partial'
    ELSE 'unknown'
  END as status
FROM (
  SELECT * FROM expanded_weekly
  UNION ALL
  SELECT * FROM unavailability_periods
) combined
ORDER BY tutor_id, date_actual, start_time;

-- 6. CREATE FUNCTION TO GET EFFECTIVE AVAILABILITY
-- ============================================
CREATE OR REPLACE FUNCTION get_tutor_effective_availability(
  p_tutor_id TEXT,
  p_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '14 days'
)
RETURNS TABLE (
  date_actual DATE,
  available_slots JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH availability_data AS (
    SELECT 
      tav.date_actual,
      tav.type,
      tav.start_time,
      tav.end_time,
      tav.is_full_day
    FROM tutor_availability_view tav
    WHERE tav.tutor_id = p_tutor_id
      AND tav.date_actual >= p_date
      AND tav.date_actual <= p_end_date
  ),
  daily_availability AS (
    SELECT 
      ad.date_actual,
      -- Start with weekly availability slots
      CASE 
        WHEN bool_or(ad.type = 'unavailability' AND ad.is_full_day) THEN '[]'::JSONB
        ELSE jsonb_agg(
          DISTINCT jsonb_build_object(
            'start_time', ad.start_time,
            'end_time', ad.end_time
          )
        ) FILTER (WHERE ad.type = 'weekly_availability')
      END as base_slots,
      -- Get unavailability periods
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'start_time', ad.start_time,
          'end_time', ad.end_time,
          'is_full_day', ad.is_full_day
        )
      ) FILTER (WHERE ad.type = 'unavailability') as unavailable_slots
    FROM availability_data ad
    GROUP BY ad.date_actual
  )
  SELECT 
    da.date_actual,
    COALESCE(da.base_slots, '[]'::JSONB) as available_slots
  FROM daily_availability da
  ORDER BY da.date_actual;
END;
$$ LANGUAGE plpgsql;
