-- ============================================
-- MIGRATION 024: CREATE TRIAL BOOKINGS TABLE
-- ============================================

-- Create trial_bookings table
CREATE TABLE IF NOT EXISTS trial_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  trial_lesson_id UUID NOT NULL,
  
  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Timezone information
  student_timezone TEXT NOT NULL,
  tutor_timezone TEXT NOT NULL,
  
  -- Notes and communication
  student_notes TEXT,
  tutor_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraints
  CONSTRAINT fk_trial_bookings_student_id 
    FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_trial_bookings_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_trial_bookings_trial_lesson_id 
    FOREIGN KEY (trial_lesson_id) REFERENCES trial_lessons(id) ON DELETE CASCADE,
    
  -- Business logic constraints
  CONSTRAINT trial_bookings_time_order_check 
    CHECK (start_time < end_time),
  CONSTRAINT trial_bookings_future_date_check 
    CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT trial_bookings_unique_tutor_time 
    UNIQUE (tutor_id, booking_date, start_time, end_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trial_bookings_student_id ON trial_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_tutor_id ON trial_bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_status ON trial_bookings(status);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_date ON trial_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_tutor_date ON trial_bookings(tutor_id, booking_date);

-- Create RLS policies
ALTER TABLE trial_bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now - authorization will be handled at application level
-- This is because we're using Clerk for auth, not Supabase Auth
CREATE POLICY "Allow all operations for authenticated users" ON trial_bookings
  FOR ALL USING (true);

-- Create function to automatically create unavailability when booking is confirmed
CREATE OR REPLACE FUNCTION create_trial_booking_unavailability()
RETURNS TRIGGER AS $$
BEGIN
  -- Create unavailability when booking is created (pending) or confirmed
  IF (NEW.status = 'pending' AND OLD.status IS NULL) OR 
     (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed')) THEN
    -- Insert unavailability for the tutor
    INSERT INTO tutor_availability (
      tutor_id,
      type,
      start_date,
      end_date,
      start_time,
      end_time,
      is_full_day
    ) VALUES (
      NEW.tutor_id,
      'unavailability',
      NEW.booking_date,
      NEW.booking_date,
      NEW.start_time,
      NEW.end_time,
      false
    );
    
    -- Update confirmed_at timestamp if confirmed
    IF NEW.status = 'confirmed' THEN
      NEW.confirmed_at = NOW();
    END IF;
  END IF;
  
  -- If booking is cancelled, remove the unavailability
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Remove the unavailability created for this booking
    DELETE FROM tutor_availability 
    WHERE tutor_id = NEW.tutor_id
      AND type = 'unavailability'
      AND start_date = NEW.booking_date
      AND end_date = NEW.booking_date
      AND start_time = NEW.start_time
      AND end_time = NEW.end_time
      AND is_full_day = false;
      
    -- Update cancelled_at timestamp
    NEW.cancelled_at = NOW();
  END IF;
  
  -- If booking status changes from pending to something else (except confirmed), remove unavailability
  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'confirmed') THEN
    -- Remove the unavailability created for this booking
    DELETE FROM tutor_availability 
    WHERE tutor_id = NEW.tutor_id
      AND type = 'unavailability'
      AND start_date = NEW.booking_date
      AND end_date = NEW.booking_date
      AND start_time = NEW.start_time
      AND end_time = NEW.end_time
      AND is_full_day = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic unavailability management
CREATE TRIGGER trial_booking_unavailability_trigger
  AFTER INSERT OR UPDATE ON trial_bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_booking_unavailability();

-- Create function to get available trial booking slots
CREATE OR REPLACE FUNCTION get_available_trial_slots(
  p_tutor_id TEXT,
  p_trial_lesson_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '14 days',
  p_student_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE (
  date_actual DATE,
  available_slots JSONB,
  trial_lesson_duration INTEGER
) AS $$
DECLARE
  lesson_duration INTEGER;
BEGIN
  -- Get trial lesson duration
  SELECT duration_minutes INTO lesson_duration
  FROM trial_lessons
  WHERE id = p_trial_lesson_id;
  
  RETURN QUERY
  WITH effective_availability AS (
    SELECT 
      ev.date_actual,
      ev.available_slots
    FROM get_tutor_effective_availability(p_tutor_id, p_start_date, p_end_date) AS ev(date_actual, available_slots)
  ),
  existing_bookings AS (
    SELECT 
      booking_date,
      start_time,
      end_time
    FROM trial_bookings
    WHERE tutor_id = p_tutor_id
      AND status IN ('pending', 'confirmed')
      AND booking_date BETWEEN p_start_date AND p_end_date
  ),
  available_slots_with_duration AS (
    SELECT 
      ea.date_actual,
      jsonb_agg(
        jsonb_build_object(
          'start_time', slot->>'start_time',
          'end_time', slot->>'end_time',
          'duration_minutes', lesson_duration
        )
      ) FILTER (
        WHERE (slot->>'end_time')::TIME - (slot->>'start_time')::TIME >= 
              (lesson_duration || ' minutes')::INTERVAL
      ) as available_slots
    FROM effective_availability ea,
    LATERAL jsonb_array_elements(ea.available_slots) as slot
    WHERE NOT EXISTS (
      SELECT 1 FROM existing_bookings eb
      WHERE eb.booking_date = ea.date_actual
        AND (
          (eb.start_time <= (slot->>'start_time')::TIME AND eb.end_time > (slot->>'start_time')::TIME) OR
          (eb.start_time < (slot->>'end_time')::TIME AND eb.end_time >= (slot->>'end_time')::TIME) OR
          (eb.start_time >= (slot->>'start_time')::TIME AND eb.end_time <= (slot->>'end_time')::TIME)
        )
    )
    GROUP BY ea.date_actual
  )
  SELECT 
    aswd.date_actual,
    COALESCE(aswd.available_slots, '[]'::JSONB) as available_slots,
    lesson_duration as trial_lesson_duration
  FROM available_slots_with_duration aswd
  WHERE jsonb_array_length(aswd.available_slots) > 0
  ORDER BY aswd.date_actual;
END;
$$ LANGUAGE plpgsql;

-- Create function to check minimum time notice
CREATE OR REPLACE FUNCTION check_minimum_time_notice(
  p_tutor_id TEXT,
  p_booking_date DATE,
  p_start_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  min_notice_hours INTEGER;
  booking_datetime TIMESTAMP;
  current_datetime TIMESTAMP;
BEGIN
  -- Get tutor's minimum time notice
  SELECT COALESCE(minimum_time_notice, 120) INTO min_notice_hours
  FROM profiles
  WHERE user_id = p_tutor_id;
  
  -- Convert to hours
  min_notice_hours := min_notice_hours / 60;
  
  -- Create booking datetime
  booking_datetime := (p_booking_date || ' ' || p_start_time)::TIMESTAMP;
  
  -- Get current datetime in tutor's timezone
  current_datetime := NOW();
  
  -- Check if booking is within minimum notice period
  RETURN booking_datetime >= current_datetime + (min_notice_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
