import { constantsAPI } from '../api/constants.ts';

export const buildResourceUrl = (path?: string | null): string | null => {
  if (!path) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${constantsAPI.baseURL}resources${normalizedPath}`;
};

export default buildResourceUrl;
