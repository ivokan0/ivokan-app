# Storage Setup for Lesson Documents

## Overview
This app requires a storage bucket called "lessons-documents" to store lesson materials uploaded by tutors.

## Setup Options

### Option 1: Apply Migration (Recommended)
Run the migration file to create the bucket and policies:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/029_create_lessons_documents_bucket.sql
```

### Option 2: Manual Setup via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage > Buckets
3. Create a new bucket called "lessons-documents"
4. Set it as public
5. Set file size limit to 50MB
6. Add allowed MIME types for documents and images

### Option 3: Fallback (Current Implementation)
The current code will automatically fallback to the "avatars" bucket if "lessons-documents" is not available.

## File Types Supported
- **Images**: JPEG, PNG, GIF, BMP, WebP
- **Documents**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
- **Text Files**: TXT, CSV, RTF, HTML, CSS, JavaScript, JSON, XML
- **Archives**: ZIP, RAR
- **Maximum file size**: 50MB per file

## MIME Type Handling
The system automatically maps file extensions to supported MIME types:
- Unknown types default to `application/pdf`
- `application/octet-stream` is automatically converted to appropriate types
- Comprehensive mapping for common file formats

## Security
- **Authentication**: Handled by Clerk (not Supabase Auth)
- **Authorization**: Controlled at application level
- **File Access**: All files are publicly accessible (for lesson sharing)
- **Organization**: Files are organized by user ID in the bucket
- **No RLS**: Row-level security is disabled on storage.objects for Clerk compatibility

## Troubleshooting
If you get storage errors:
1. Check that the bucket exists
2. Verify the bucket is public
3. Check that the user is authenticated via Clerk
4. Ensure file size is under 50MB limit
5. Check file type is in allowed MIME types

## Clerk Authentication Notes
- This setup is designed for Clerk authentication
- No RLS policies are applied to storage.objects
- File access control is handled in your application code
- User ID is included in file paths for organization
