# Withdrawal System Implementation

## Overview
This document describes the implementation of a comprehensive withdrawal system for tutors in the Ivokan app, allowing them to request withdrawals from their earnings balance.

## Database Changes

### 1. New Table: `withdrawal_requests`
- **tutor_id**: References the tutor making the withdrawal request
- **amount**: The withdrawal amount (must be > 0)
- **payment_method_id**: References the tutor's payment method
- **status**: One of 'pending', 'done', or 'rejected'
- **notes**: Optional notes from the tutor
- **payment_proof_url**: URL to uploaded payment proof file
- **payment_proof_uploaded_at**: Timestamp when proof was uploaded
- **created_at** and **updated_at**: Standard timestamps

### 2. New Storage Bucket: `payment_proofs`
- Private bucket for storing payment proof documents
- Files organized by withdrawal ID

### 3. Modified Table: `earnings`
- Added **balance** column to track current available balance
- Balance increases when earnings status changes to 'gained'
- Balance decreases when withdrawals are pending or completed
- Balance restored when withdrawals are rejected

## Database Triggers and Functions

### Automatic Balance Management
- **update_earnings_balance()**: Updates balance when earnings status changes
- **update_balance_on_withdrawal()**: Updates balance when withdrawal status changes
- **update_balance_on_withdrawal_insert()**: Updates balance when new withdrawals are created

### Row Level Security (RLS)
- Users can only see and modify their own withdrawal requests
- Proper foreign key constraints ensure data integrity

## Frontend Components

### 1. WithdrawalScreen (`src/screens/tutor/WithdrawalScreen.tsx`)
- Form for tutors to request withdrawals
- Amount input with validation
- Payment method selection
- Optional notes field
- Integration with payment methods system

### 2. WithdrawalHistory (`src/components/WithdrawalHistory.tsx`)
- Tabbed interface showing both earnings and withdrawal history
- **Earnings Tab**: Shows all earnings with student details
- **Withdrawals Tab**: Shows withdrawal requests with status and payment proof download

### 3. Updated TutorEarningsBalance (`src/components/TutorEarningsBalance.tsx`)
- Now displays:
  - **Balance**: Current available amount
  - **Pending Earnings**: Amount still pending
  - **Pending Withdrawals**: Amount in withdrawal requests
- Added withdrawal button that navigates to withdrawal screen

## Services and Hooks

### 1. Withdrawal Service (`src/services/withdrawals.ts`)
- `createWithdrawalRequest()`: Create new withdrawal
- `getTutorWithdrawalRequests()`: Get tutor's withdrawal history
- `updateWithdrawalRequestStatus()`: Update withdrawal status
- `uploadPaymentProof()`: Upload payment proof files
- `getTutorWithdrawalSummary()`: Get withdrawal statistics

### 2. Updated Earnings Service (`src/services/earnings.ts`)
- Modified to include balance information in summaries
- Balance automatically calculated from database

### 3. useWithdrawals Hook (`src/hooks/useWithdrawals.ts`)
- Manages withdrawal state and operations
- Integrates with withdrawal service
- Provides loading states and error handling

## Navigation Updates

### 1. New Route: `Withdrawal`
- Added to `AppStackParamList`
- Configured with proper header styling
- Accessible from earnings screen

### 2. Updated EarningsScreen
- Now includes withdrawal functionality
- Uses new `WithdrawalHistory` component with tabs
- Integrates withdrawal summary data

## Translation Support

### English (`src/translations/en.json`)
- Added withdrawal-related keys under `tutor` section
- Includes all UI text for withdrawal system

### French (`src/translations/fr.json`)
- French translations for all withdrawal functionality
- Maintains consistency with existing language support

## Key Features

### 1. Balance Management
- Automatic balance calculation based on earnings and withdrawals
- Real-time updates when statuses change
- Prevents over-withdrawal through database constraints

### 2. Payment Proof System
- Secure file upload to private storage bucket
- Download functionality for completed withdrawals
- Organized file structure by withdrawal ID

### 3. Status Tracking
- **Pending**: Withdrawal request submitted, balance deducted
- **Done**: Withdrawal completed, balance remains deducted
- **Rejected**: Withdrawal rejected, balance restored

### 4. Payment Method Integration
- Seamless integration with existing payment methods
- Validation that tutor has payment methods before withdrawal
- Support for multiple payment types (mobile money, bank transfer, etc.)

## Security Features

### 1. Row Level Security
- Users can only access their own withdrawal data
- Proper authentication checks on all operations

### 2. File Security
- Payment proofs stored in private bucket
- Access controlled through authenticated URLs
- No public access to sensitive documents

### 3. Data Validation
- Amount validation (must be positive)
- Payment method existence validation
- Balance sufficiency checks

## Usage Flow

### 1. Tutor Requests Withdrawal
1. Navigate to Earnings screen
2. Click "Request Withdrawal" button
3. Enter amount and select payment method
4. Add optional notes
5. Submit request

### 2. Balance Updates
1. Balance automatically deducted when request is pending
2. Balance remains deducted when request is completed
3. Balance restored if request is rejected

### 3. History Tracking
1. View earnings and withdrawals in separate tabs
2. Track status changes over time
3. Download payment proofs when available

## Migration Instructions

### 1. Run Database Migration
```sql
-- Execute the migration file:
-- supabase/migrations/031_create_withdrawal_system.sql
```

### 2. Update Frontend
- All new components and services are ready to use
- No breaking changes to existing functionality
- Withdrawal system integrates seamlessly with current earnings

### 3. Test Integration
- Verify balance calculations work correctly
- Test withdrawal request creation
- Confirm payment proof upload/download functionality
- Validate status change workflows

## Future Enhancements

### 1. Admin Panel
- Admin interface for managing withdrawal requests
- Bulk status updates
- Reporting and analytics

### 2. Automated Processing
- Integration with payment gateways
- Automatic status updates based on payment confirmation
- Email notifications for status changes

### 3. Advanced Features
- Recurring withdrawal schedules
- Multiple currency support
- Withdrawal limits and restrictions
- Advanced reporting and analytics

## Conclusion

The withdrawal system provides a comprehensive solution for tutors to manage their earnings and request withdrawals. The implementation follows best practices for security, data integrity, and user experience, while maintaining compatibility with the existing application architecture.
