-- ============================================
-- MIGRATION 023: IMPROVE SLOT SUBTRACTION
-- ============================================

-- Drop existing functions and views
DROP FUNCTION IF EXISTS get_tutor_effective_availability(TEXT, DATE, DATE);
DROP VIEW IF EXISTS tutor_availability_view;

-- Create a function to subtract time ranges
CREATE OR REPLACE FUNCTION subtract_time_ranges(
  p_start_time TIME,
  p_end_time TIME,
  p_unavailable_start TIME,
  p_unavailable_end TIME
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '[]'::JSONB;
BEGIN
  -- If no overlap, return original slot
  IF p_unavailable_end <= p_start_time OR p_unavailable_start >= p_end_time THEN
    RETURN jsonb_build_array(
      jsonb_build_object(
        'start_time', p_start_time,
        'end_time', p_end_time
      )
    );
  END IF;
  
  -- If complete overlap, return empty array
  IF p_unavailable_start <= p_start_time AND p_unavailable_end >= p_end_time THEN
    RETURN '[]'::JSONB;
  END IF;
  
  -- Partial overlap - split the slot
  -- Add part before unavailability (if any)
  IF p_start_time < p_unavailable_start THEN
    result := result || jsonb_build_object(
      'start_time', p_start_time,
      'end_time', p_unavailable_start
    );
  END IF;
  
  -- Add part after unavailability (if any)
  IF p_end_time > p_unavailable_end THEN
    result := result || jsonb_build_object(
      'start_time', p_unavailable_end,
      'end_time', p_end_time
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create improved view with proper slot subtraction
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
    'available' as type,
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
    CASE 
      WHEN ta.is_full_day THEN 'unavailable_full_day'
      ELSE 'unavailable_partial'
    END as type,
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
),
-- Calculate effective availability with proper slot subtraction
effective_slots AS (
  SELECT 
    ew.tutor_id,
    ew.date_actual,
    ew.day_of_week,
    ew.availability_id,
    -- Check for full day unavailability first
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unavailability_periods up 
        WHERE up.tutor_id = ew.tutor_id 
          AND up.date_actual = ew.date_actual
          AND up.type = 'unavailable_full_day'
      ) THEN 'unavailable_full_day'
      ELSE 'available'
    END as status,
    -- Calculate available slots by subtracting partial unavailability
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unavailability_periods up 
        WHERE up.tutor_id = ew.tutor_id 
          AND up.date_actual = ew.date_actual
          AND up.type = 'unavailable_full_day'
      ) THEN '[]'::JSONB
      ELSE (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'start_time', slot->>'start_time',
              'end_time', slot->>'end_time'
            )
          ),
          '[]'::JSONB
        )
        FROM (
          SELECT 
            CASE 
              -- If no partial unavailability, return original slot
              WHEN NOT EXISTS (
                SELECT 1 FROM unavailability_periods up 
                WHERE up.tutor_id = ew.tutor_id 
                  AND up.date_actual = ew.date_actual
                  AND up.type = 'unavailable_partial'
              ) THEN jsonb_build_array(
                jsonb_build_object(
                  'start_time', ew.start_time,
                  'end_time', ew.end_time
                )
              )
              ELSE (
                -- Apply all partial unavailability periods
                SELECT jsonb_agg(slot)
                FROM (
                  WITH RECURSIVE slot_subtraction AS (
                    -- Start with original slot
                    SELECT 
                      1 as iteration,
                      jsonb_build_array(
                        jsonb_build_object(
                          'start_time', ew.start_time,
                          'end_time', ew.end_time
                        )
                      ) as remaining_slots
                    
                    UNION ALL
                    
                    -- Subtract next unavailability period
                    SELECT 
                      ss.iteration + 1,
                      (
                        SELECT jsonb_agg(new_slot)
                        FROM (
                          SELECT slot
                          FROM jsonb_array_elements(ss.remaining_slots) as slot
                        ) slots,
                        LATERAL (
                          SELECT subtract_time_ranges(
                            (slot->>'start_time')::TIME,
                            (slot->>'end_time')::TIME,
                            up.start_time,
                            up.end_time
                          ) as new_slots
                          FROM unavailability_periods up
                          WHERE up.tutor_id = ew.tutor_id 
                            AND up.date_actual = ew.date_actual
                            AND up.type = 'unavailable_partial'
                          ORDER BY up.start_time
                          LIMIT 1 OFFSET ss.iteration - 1
                        ) subtraction
                        CROSS JOIN LATERAL jsonb_array_elements(subtraction.new_slots) as new_slot
                      )
                    FROM slot_subtraction ss
                    WHERE ss.iteration <= (
                      SELECT COUNT(*)
                      FROM unavailability_periods up
                      WHERE up.tutor_id = ew.tutor_id 
                        AND up.date_actual = ew.date_actual
                        AND up.type = 'unavailable_partial'
                    )
                  )
                  SELECT remaining_slots
                  FROM slot_subtraction
                  ORDER BY iteration DESC
                  LIMIT 1
                ) final_slots,
                LATERAL jsonb_array_elements(final_slots.remaining_slots) as slot
              )
            END as slot
        ) slot_calculation
      )
    END as available_slots
  FROM expanded_weekly ew
)
SELECT 
  tutor_id,
  CASE 
    WHEN status = 'available' THEN 'weekly_availability'
    ELSE 'unavailability'
  END as type,
  date_actual,
  day_of_week,
  -- Extract start_time and end_time from available_slots for backward compatibility
  CASE 
    WHEN status = 'available' AND jsonb_array_length(available_slots) > 0 
    THEN (available_slots->0->>'start_time')::TIME
    ELSE NULL
  END as start_time,
  CASE 
    WHEN status = 'available' AND jsonb_array_length(available_slots) > 0 
    THEN (available_slots->0->>'end_time')::TIME
    ELSE NULL
  END as end_time,
  NULL::DATE as unavailable_start_date,
  NULL::DATE as unavailable_end_date,
  CASE WHEN status = 'unavailable_full_day' THEN true ELSE NULL END as is_full_day,
  availability_id,
  status,
  available_slots
FROM effective_slots
WHERE status = 'available' AND jsonb_array_length(available_slots) > 0

UNION ALL

-- Add unavailability periods for display
SELECT 
  tutor_id,
  'unavailability' as type,
  date_actual,
  day_of_week,
  start_time,
  end_time,
  unavailable_start_date,
  unavailable_end_date,
  is_full_day,
  availability_id,
  type as status,
  NULL::JSONB as available_slots
FROM unavailability_periods

ORDER BY tutor_id, date_actual, start_time;

-- Create improved function for effective availability calculation
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
  WITH weekly_slots AS (
    -- Get all weekly availability slots for the date range
    SELECT 
      d.date_actual,
      ta.start_time,
      ta.end_time
    FROM tutor_availability ta
    CROSS JOIN LATERAL (
      SELECT generate_series(p_date, p_end_date, '1 day'::interval)::DATE as date_actual
    ) d
    WHERE ta.tutor_id = p_tutor_id
      AND ta.type = 'weekly_availability'
      AND EXTRACT(DOW FROM d.date_actual)::INTEGER = ta.day_of_week
  ),
  unavailable_periods AS (
    -- Get unavailability that affects our date range
    SELECT 
      d.date_actual,
      ta.start_time,
      ta.end_time,
      ta.is_full_day
    FROM tutor_availability ta
    CROSS JOIN LATERAL (
      SELECT generate_series(
        GREATEST(ta.start_date, p_date),
        LEAST(ta.end_date, p_end_date),
        '1 day'::interval
      )::DATE as date_actual
    ) d
    WHERE ta.tutor_id = p_tutor_id
      AND ta.type = 'unavailability'
      AND ta.start_date <= p_end_date
      AND ta.end_date >= p_date
  ),
  daily_calculation AS (
    SELECT 
      ws.date_actual,
      CASE 
        -- If full day unavailable, no slots
        WHEN EXISTS (
          SELECT 1 FROM unavailable_periods up 
          WHERE up.date_actual = ws.date_actual AND up.is_full_day = true
        ) THEN '[]'::JSONB
        ELSE (
          -- Calculate available slots by subtracting all partial unavailability periods
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'start_time', slot->>'start_time',
                'end_time', slot->>'end_time'
              )
            ),
            '[]'::JSONB
          )
          FROM (
            WITH RECURSIVE slot_subtraction AS (
              -- Start with original slot
              SELECT 
                1 as iteration,
                jsonb_build_array(
                  jsonb_build_object(
                    'start_time', ws.start_time,
                    'end_time', ws.end_time
                  )
                ) as remaining_slots
              
              UNION ALL
              
              -- Subtract next unavailability period
              SELECT 
                ss.iteration + 1,
                (
                  SELECT jsonb_agg(new_slot)
                  FROM (
                    SELECT slot
                    FROM jsonb_array_elements(ss.remaining_slots) as slot
                  ) slots,
                  LATERAL (
                    SELECT subtract_time_ranges(
                      (slot->>'start_time')::TIME,
                      (slot->>'end_time')::TIME,
                      up.start_time,
                      up.end_time
                    ) as new_slots
                    FROM unavailable_periods up
                    WHERE up.date_actual = ws.date_actual
                      AND up.is_full_day = false
                    ORDER BY up.start_time
                    LIMIT 1 OFFSET ss.iteration - 1
                  ) subtraction
                  CROSS JOIN LATERAL jsonb_array_elements(subtraction.new_slots) as new_slot
                )
              FROM slot_subtraction ss
              WHERE ss.iteration <= (
                SELECT COUNT(*)
                FROM unavailable_periods up
                WHERE up.date_actual = ws.date_actual
                  AND up.is_full_day = false
              )
            )
            SELECT remaining_slots
            FROM slot_subtraction
            ORDER BY iteration DESC
            LIMIT 1
          ) final_slots,
          LATERAL jsonb_array_elements(final_slots.remaining_slots) as slot
        )
      END as available_slots
    FROM weekly_slots ws
  )
  SELECT 
    dc.date_actual,
    COALESCE(dc.available_slots, '[]'::JSONB) as available_slots
  FROM daily_calculation dc
  ORDER BY dc.date_actual;
END;
$$ LANGUAGE plpgsql;

-- Create a simpler function for testing slot subtraction
CREATE OR REPLACE FUNCTION test_slot_subtraction(
  p_weekly_start TIME,
  p_weekly_end TIME,
  p_unavailable_periods JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := jsonb_build_array(
    jsonb_build_object(
      'start_time', p_weekly_start,
      'end_time', p_weekly_end
    )
  );
  period JSONB;
BEGIN
  -- Apply each unavailability period
  FOR period IN SELECT * FROM jsonb_array_elements(p_unavailable_periods)
  LOOP
    SELECT jsonb_agg(new_slot)
    INTO result
    FROM (
      SELECT slot
      FROM jsonb_array_elements(result) as slot
    ) slots,
    LATERAL (
      SELECT subtract_time_ranges(
        (slot->>'start_time')::TIME,
        (slot->>'end_time')::TIME,
        (period->>'start_time')::TIME,
        (period->>'end_time')::TIME
      ) as new_slots
    ) subtraction
    CROSS JOIN LATERAL jsonb_array_elements(subtraction.new_slots) as new_slot;
  END LOOP;
  
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;
