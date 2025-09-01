-- ============================================
-- MIGRATION 030: CREATE SUBSCRIPTION BOOKINGS TABLE
-- ============================================

-- Create subscription_bookings table
CREATE TABLE IF NOT EXISTS subscription_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  student_subscriptions_id UUID NOT NULL,
  
  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  
  -- Timezone information
  student_timezone TEXT NOT NULL,
  tutor_timezone TEXT NOT NULL,
  
  -- Notes and communication
  student_notes TEXT,
  tutor_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraints
  CONSTRAINT fk_subscription_bookings_student_id 
    FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_bookings_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_bookings_student_subscriptions_id 
    FOREIGN KEY (student_subscriptions_id) REFERENCES student_subscriptions(id) ON DELETE CASCADE,
    
  -- Business logic constraints
  CONSTRAINT subscription_bookings_time_order_check 
    CHECK (start_time < end_time),
  CONSTRAINT subscription_bookings_future_date_check 
    CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT subscription_bookings_unique_tutor_time 
    UNIQUE (tutor_id, booking_date, start_time, end_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_student_id ON subscription_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_tutor_id ON subscription_bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_status ON subscription_bookings(status);
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_date ON subscription_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_tutor_date ON subscription_bookings(tutor_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_subscription_bookings_subscription_id ON subscription_bookings(student_subscriptions_id);

-- Create RLS policies
ALTER TABLE subscription_bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now - authorization will be handled at application level
-- This is because we're using Clerk for auth, not Supabase Auth
CREATE POLICY "Allow all operations for authenticated users" ON subscription_bookings
  FOR ALL USING (true);

-- Create function to automatically create unavailability when subscription booking is created
CREATE OR REPLACE FUNCTION create_subscription_booking_unavailability()
RETURNS TRIGGER AS $$
BEGIN
  -- Create unavailability when booking is created (confirmed)
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription booking unavailability
CREATE TRIGGER subscription_booking_unavailability_trigger
  AFTER INSERT OR UPDATE ON subscription_bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_booking_unavailability();

-- Create function to check if subscription has remaining sessions
CREATE OR REPLACE FUNCTION check_subscription_booking_eligibility(
  p_student_subscriptions_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get subscription details
  SELECT remaining_sessions, status INTO subscription_record
  FROM student_subscriptions
  WHERE id = p_student_subscriptions_id;
  
  -- Check if subscription exists and has remaining sessions
  IF subscription_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF subscription_record.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  IF subscription_record.remaining_sessions <= 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement remaining sessions when subscription booking is completed
CREATE OR REPLACE FUNCTION decrement_subscription_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement remaining sessions when booking is marked as completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE student_subscriptions
    SET 
      remaining_sessions = remaining_sessions - 1,
      status = CASE WHEN remaining_sessions - 1 <= 0 THEN 'expired' ELSE status END
    WHERE id = NEW.student_subscriptions_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for decrementing subscription sessions
CREATE TRIGGER subscription_booking_session_decrement_trigger
  AFTER UPDATE ON subscription_bookings
  FOR EACH ROW
  EXECUTE FUNCTION decrement_subscription_sessions();
