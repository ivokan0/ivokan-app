-- Test script for slot subtraction functionality
-- This script tests the new slot subtraction logic in Supabase

-- Test 1: Basic slot subtraction
SELECT 'Test 1: Basic slot subtraction' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '17:00'::TIME,
  '[{"start_time": "14:00", "end_time": "16:00"}]'::JSONB
) as result;

-- Expected: [{"start_time": "09:00", "end_time": "14:00"}, {"start_time": "16:00", "end_time": "17:00"}]

-- Test 2: No overlap
SELECT 'Test 2: No overlap' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '12:00'::TIME,
  '[{"start_time": "14:00", "end_time": "16:00"}]'::JSONB
) as result;

-- Expected: [{"start_time": "09:00", "end_time": "12:00"}]

-- Test 3: Complete overlap
SELECT 'Test 3: Complete overlap' as test_name;
SELECT test_slot_subtraction(
  '14:00'::TIME,
  '16:00'::TIME,
  '[{"start_time": "14:00", "end_time": "16:00"}]'::JSONB
) as result;

-- Expected: []

-- Test 4: Multiple unavailability periods
SELECT 'Test 4: Multiple unavailability periods' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '18:00'::TIME,
  '[
    {"start_time": "11:00", "end_time": "12:00"},
    {"start_time": "14:00", "end_time": "16:00"}
  ]'::JSONB
) as result;

-- Expected: [
--   {"start_time": "09:00", "end_time": "11:00"},
--   {"start_time": "12:00", "end_time": "14:00"},
--   {"start_time": "16:00", "end_time": "18:00"}
-- ]

-- Test 5: Overlapping unavailability periods
SELECT 'Test 5: Overlapping unavailability periods' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '18:00'::TIME,
  '[
    {"start_time": "11:00", "end_time": "15:00"},
    {"start_time": "14:00", "end_time": "16:00"}
  ]'::JSONB
) as result;

-- Expected: [
--   {"start_time": "09:00", "end_time": "11:00"},
--   {"start_time": "16:00", "end_time": "18:00"}
-- ]

-- Test 6: Edge case - unavailability at start
SELECT 'Test 6: Unavailability at start' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '17:00'::TIME,
  '[{"start_time": "09:00", "end_time": "11:00"}]'::JSONB
) as result;

-- Expected: [{"start_time": "11:00", "end_time": "17:00"}]

-- Test 7: Edge case - unavailability at end
SELECT 'Test 7: Unavailability at end' as test_name;
SELECT test_slot_subtraction(
  '09:00'::TIME,
  '17:00'::TIME,
  '[{"start_time": "15:00", "end_time": "17:00"}]'::JSONB
) as result;

-- Expected: [{"start_time": "09:00", "end_time": "15:00"}]

-- Test 8: Complex scenario with multiple splits
SELECT 'Test 8: Complex scenario' as test_name;
SELECT test_slot_subtraction(
  '08:00'::TIME,
  '20:00'::TIME,
  '[
    {"start_time": "10:00", "end_time": "12:00"},
    {"start_time": "14:00", "end_time": "16:00"},
    {"start_time": "18:00", "end_time": "19:00"}
  ]'::JSONB
) as result;

-- Expected: [
--   {"start_time": "08:00", "end_time": "10:00"},
--   {"start_time": "12:00", "end_time": "14:00"},
--   {"start_time": "16:00", "end_time": "18:00"},
--   {"start_time": "19:00", "end_time": "20:00"}
-- ]

-- Test the main function with sample data
-- First, let's create some test data
INSERT INTO tutor_availability (tutor_id, type, day_of_week, start_time, end_time) 
VALUES ('test_tutor', 'weekly_availability', 1, '09:00', '17:00')
ON CONFLICT DO NOTHING;

INSERT INTO tutor_availability (tutor_id, type, start_date, end_date, start_time, end_time, is_full_day) 
VALUES 
  ('test_tutor', 'unavailability', '2024-01-15', '2024-01-15', '14:00', '16:00', false),
  ('test_tutor', 'unavailability', '2024-01-16', '2024-01-16', '11:00', '12:00', false)
ON CONFLICT DO NOTHING;

-- Test the effective availability function
SELECT 'Test 9: Effective availability function' as test_name;
SELECT * FROM get_tutor_effective_availability('test_tutor', '2024-01-15', '2024-01-16');

-- Clean up test data
DELETE FROM tutor_availability WHERE tutor_id = 'test_tutor';
