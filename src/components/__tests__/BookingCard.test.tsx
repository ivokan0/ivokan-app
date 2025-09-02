import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import { I18nextProvider } from 'react-i18next';

import BookingCard from '../BookingCard';
import { UnifiedBooking } from '../../utils/bookingUtils';
import i18n from '../../translations/i18n';

// Mock theme
const mockTheme = {
  colors: {
    surface: '#ffffff',
    onSurface: '#000000',
    onSurfaceVariant: '#666666',
    primary: '#007AFF',
    onPrimary: '#ffffff',
  },
};

// Mock booking data
const mockTrialBooking: UnifiedBooking = {
  id: '1',
  student_id: 'student1',
  tutor_id: 'tutor1',
  booking_date: '2024-01-15',
  start_time: '10:00:00',
  end_time: '11:00:00',
  status: 'confirmed',
  student_timezone: 'UTC+1',
  tutor_timezone: 'UTC+1',
  student_notes: 'I want to practice conversation',
  tutor_notes: 'Focus on pronunciation',
  trial_lesson_id: 'trial1',
  language_id: 'english',
  isTrial: true,
  duration_minutes: 60,
};

const mockSubscriptionBooking: UnifiedBooking = {
  id: '2',
  student_id: 'student1',
  tutor_id: 'tutor1',
  booking_date: '2024-01-16',
  start_time: '14:00:00',
  end_time: '15:00:00',
  status: 'confirmed',
  student_timezone: 'UTC+1',
  tutor_timezone: 'UTC+1',
  student_notes: 'Continue with grammar',
  lesson_documents_urls: ['doc1.pdf', 'doc2.pdf'],
  student_subscriptions_id: 'sub1',
  isTrial: false,
  duration_minutes: 60,
};

describe('BookingCard', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={mockTheme}>
          {component}
        </ThemeProvider>
      </I18nextProvider>
    );
  };

  it('renders trial booking correctly', () => {
    const { getByText } = renderWithProviders(
      <BookingCard
        booking={mockTrialBooking}
        tutorName="John Doe"
        language={{ id: '1', name: 'English', code: 'en' }}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Trial Lesson')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('1h')).toBeTruthy();
    expect(getByText('Student Notes: I want to practice conversation')).toBeTruthy();
    expect(getByText('Tutor Notes: Focus on pronunciation')).toBeTruthy();
  });

  it('renders subscription booking correctly', () => {
    const { getByText } = renderWithProviders(
      <BookingCard
        booking={mockSubscriptionBooking}
        tutorName="Jane Smith"
        language={{ id: '1', name: 'French', code: 'fr' }}
      />
    );

    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Subscription Lesson')).toBeTruthy();
    expect(getByText('French')).toBeTruthy();
    expect(getByText('1h')).toBeTruthy();
    expect(getByText('Student Notes: Continue with grammar')).toBeTruthy();
    expect(getByText('Documents (2)')).toBeTruthy();
  });

  it('renders without optional fields', () => {
    const minimalBooking: UnifiedBooking = {
      ...mockTrialBooking,
      student_notes: undefined,
      tutor_notes: undefined,
      duration_minutes: undefined,
    };

    const { getByText, queryByText } = renderWithProviders(
      <BookingCard
        booking={minimalBooking}
        tutorName="John Doe"
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(queryByText('Student Notes:')).toBeFalsy();
    expect(queryByText('Tutor Notes:')).toBeFalsy();
    expect(queryByText('1h')).toBeFalsy();
  });
});
