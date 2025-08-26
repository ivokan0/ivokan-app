-- ============================================
-- MIGRATION 020: IMPROVE AVAILABILITY CALCULATION
-- ============================================

-- Drop the existing view and function to recreate them with better logic
DROP VIEW IF EXISTS tutor_availability_view;
DROP FUNCTION IF EXISTS get_tutor_effective_availability(TEXT, DATE, DATE);

-- Create improved view that calculates effective availability
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
combined_data AS (
  SELECT * FROM expanded_weekly
  UNION ALL
  SELECT * FROM unavailability_periods
),
-- Calculate effective availability by subtracting unavailability from weekly availability
effective_slots AS (
  SELECT DISTINCT
    cd.tutor_id,
    cd.date_actual,
    cd.day_of_week,
    cd.start_time as available_start,
    cd.end_time as available_end,
    -- Check if this slot is affected by any unavailability
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unavailability_periods up 
        WHERE up.tutor_id = cd.tutor_id 
          AND up.date_actual = cd.date_actual
          AND up.type = 'unavailable_full_day'
      ) THEN 'unavailable_full_day'
      WHEN EXISTS (
        SELECT 1 FROM unavailability_periods up 
        WHERE up.tutor_id = cd.tutor_id 
          AND up.date_actual = cd.date_actual
          AND up.type = 'unavailable_partial'
          AND (
            -- Unavailability overlaps with this available slot
            (up.start_time <= cd.start_time AND up.end_time > cd.start_time) OR
            (up.start_time < cd.end_time AND up.end_time >= cd.end_time) OR
            (up.start_time >= cd.start_time AND up.end_time <= cd.end_time)
          )
      ) THEN 'unavailable_partial'
      ELSE 'available'
    END as status,
    cd.availability_id
  FROM combined_data cd
  WHERE cd.type = 'available'
)
SELECT 
  tutor_id,
  CASE 
    WHEN status = 'available' THEN 'weekly_availability'
    ELSE 'unavailability'
  END as type,
  date_actual,
  day_of_week,
  CASE WHEN status = 'available' THEN available_start END as start_time,
  CASE WHEN status = 'available' THEN available_end END as end_time,
  NULL::DATE as unavailable_start_date,
  NULL::DATE as unavailable_end_date,
  CASE WHEN status = 'unavailable_full_day' THEN true ELSE NULL END as is_full_day,
  availability_id,
  status
FROM effective_slots
WHERE status = 'available'

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
  type as status
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
    SELECT DISTINCT
      ws.date_actual,
      CASE 
        -- If full day unavailable, no slots
        WHEN EXISTS (
          SELECT 1 FROM unavailable_periods up 
          WHERE up.date_actual = ws.date_actual AND up.is_full_day = true
        ) THEN '[]'::JSONB
        ELSE 
          -- Calculate available slots minus unavailable periods
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'start_time', ws.start_time,
              'end_time', ws.end_time
            )
          ) FILTER (
            WHERE NOT EXISTS (
              SELECT 1 FROM unavailable_periods up 
              WHERE up.date_actual = ws.date_actual 
                AND up.is_full_day = false
                AND (
                  (up.start_time <= ws.start_time AND up.end_time > ws.start_time) OR
                  (up.start_time < ws.end_time AND up.end_time >= ws.end_time) OR
                  (up.start_time >= ws.start_time AND up.end_time <= ws.end_time)
                )
            )
          )
      END as available_slots
    FROM weekly_slots ws
    GROUP BY ws.date_actual
  )
  SELECT 
    dc.date_actual,
    COALESCE(dc.available_slots, '[]'::JSONB) as available_slots
  FROM daily_calculation dc
  ORDER BY dc.date_actual;
END;
$$ LANGUAGE plpgsql;
