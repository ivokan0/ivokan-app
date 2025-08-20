import type { TFunction } from 'i18next';

export const translateSupabaseError = (error: unknown, t: TFunction): string => {
  const message = typeof error === 'object' && error && 'message' in error ? String((error as any).message) : String(error ?? '');
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) return t('errors.auth.invalidCredentials');
  if (normalized.includes('email not confirmed')) return t('errors.auth.emailNotConfirmed');
  if (normalized.includes('user already registered')) return t('errors.auth.alreadyRegistered');
  if (normalized.includes('email rate limit exceeded')) return t('errors.auth.rateLimited');
  if (normalized.includes('password should be at least')) return t('errors.auth.passwordTooShort');
  if (normalized.includes('user not found')) return t('errors.auth.userNotFound');
  if (normalized.includes('network request failed')) return t('errors.network');

  return t('errors.unknown');
};


