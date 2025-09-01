-- Create lessons-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lessons-documents',
  'lessons-documents',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/json',
    'application/xml',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Since we're using Clerk for auth, we'll disable RLS on storage.objects
-- and handle authorization at the application level instead
-- This is the same approach used in your subscription_bookings table

-- Note: RLS policies for storage.objects require Supabase Auth
-- With Clerk, we handle file access control in the application code
-- The bucket will be public but access is controlled by your app logic
