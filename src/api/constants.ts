const DEFAULT_API_BASE_URL = 'https://ya-praktikum.tech/api/v2/';

const resolveBaseUrl = (): string => {
  const envValue =
    typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_API_BASE_URL === 'string'
      ? import.meta.env.VITE_API_BASE_URL
      : null;

  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return envValue.trim();
  }

  return DEFAULT_API_BASE_URL;
};

export const constantsAPI = {
  baseURL: resolveBaseUrl(),
} as const;
