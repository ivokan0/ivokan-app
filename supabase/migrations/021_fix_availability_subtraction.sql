-- ============================================
-- MIGRATION 021: FIX AVAILABILITY SUBTRACTION
-- ============================================

-- Drop the existing function to recreate it with proper slot splitting logic
DROP FUNCTION IF EXISTS get_tutor_effective_availability(TEXT, DATE, DATE);

-- Create improved function that properly splits slots instead of removing them entirely
CREATE OR REPLACE FUNCTION get_tutor_effective_availability(
  p_tutor_id TEXT,
  p_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '14 days'
)
RETURNS TABLE (
  date_actual DATE,
  available_slots JSONB
) AS $$
DECLARE
  current_date DATE;
  weekly_slot RECORD;
  unavail_period RECORD;
  slot_start TIME;
  slot_end TIME;
  unavail_start TIME;
  unavail_end TIME;
  temp_slots JSONB;
  final_slots JSONB;
  temp_slot JSONB;
  new_slots JSONB;
BEGIN
  -- Loop through each date in the range
  FOR current_date IN SELECT generate_series(p_date, p_end_date, '1 day'::interval)::DATE
  LOOP
    final_slots := '[]'::JSONB;
    
    -- Check if this day has full day unavailability
    IF EXISTS (
      SELECT 1 FROM tutor_availability 
      WHERE tutor_id = p_tutor_id 
        AND type = 'unavailability'
        AND start_date <= current_date 
        AND end_date >= current_date
        AND is_full_day = true
    ) THEN
      -- Full day unavailable, return empty slots
      date_actual := current_date;
      available_slots := '[]'::JSONB;
      RETURN NEXT;
      CONTINUE;
    END IF;
    
    -- Get weekly availability for this day of week
    FOR weekly_slot IN 
      SELECT start_time, end_time 
      FROM tutor_availability 
      WHERE tutor_id = p_tutor_id 
        AND type = 'weekly_availability'
        AND day_of_week = EXTRACT(DOW FROM current_date)::INTEGER
    LOOP
      -- Start with the full weekly slot
      temp_slots := jsonb_build_array(jsonb_build_object(
        'start_time', weekly_slot.start_time::TEXT,
        'end_time', weekly_slot.end_time::TEXT
      ));
      
      -- Apply each unavailability period to split the slots
      FOR unavail_period IN 
        SELECT start_time, end_time 
        FROM tutor_availability 
        WHERE tutor_id = p_tutor_id 
          AND type = 'unavailability'
          AND start_date <= current_date 
          AND end_date >= current_date
          AND is_full_day = false
          AND start_time IS NOT NULL 
          AND end_time IS NOT NULL
      LOOP
        new_slots := '[]'::JSONB;
        unavail_start := unavail_period.start_time;
        unavail_end := unavail_period.end_time;
        
        -- Process each current slot
        FOR i IN 0..(jsonb_array_length(temp_slots) - 1)
        LOOP
          temp_slot := temp_slots -> i;
          slot_start := (temp_slot ->> 'start_time')::TIME;
          slot_end := (temp_slot ->> 'end_time')::TIME;
          
          -- Check for overlap
          IF unavail_end <= slot_start OR unavail_start >= slot_end THEN
            -- No overlap, keep the slot
            new_slots := new_slots || jsonb_build_array(temp_slot);
          ELSE
            -- There is overlap, split the slot
            
            -- Add part before unavailability (if any)
            IF slot_start < unavail_start THEN
              new_slots := new_slots || jsonb_build_array(jsonb_build_object(
                'start_time', slot_start::TEXT,
                'end_time', unavail_start::TEXT
              ));
            END IF;
            
            -- Add part after unavailability (if any)
            IF slot_end > unavail_end THEN
              new_slots := new_slots || jsonb_build_array(jsonb_build_object(
                'start_time', unavail_end::TEXT,
                'end_time', slot_end::TEXT
              ));
            END IF;
          END IF;
        END LOOP;
        
        temp_slots := new_slots;
      END LOOP;
      
      -- Add the processed slots to final result
      final_slots := final_slots || temp_slots;
    END LOOP;
    
    -- Return the result for this date
    date_actual := current_date;
    available_slots := final_slots;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
