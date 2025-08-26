-- ============================================
-- MIGRATION 026: FIX TRIAL BOOKING UNAVAILABILITY TRIGGER
-- ============================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trial_booking_unavailability_trigger ON trial_bookings;

-- Drop the existing function
DROP FUNCTION IF EXISTS create_trial_booking_unavailability();

-- Recreate the function with corrected logic
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

-- Recreate the trigger
CREATE TRIGGER trial_booking_unavailability_trigger
  AFTER INSERT OR UPDATE ON trial_bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_booking_unavailability();
