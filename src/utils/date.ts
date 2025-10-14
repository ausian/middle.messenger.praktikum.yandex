const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const formatTime = (value: string | Date | undefined | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDateLabel = (
  value: string | Date | undefined | null,
): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);

  if (diffMs === 0) return 'Сегодня';
  if (diffMs === 24 * 60 * 60 * 1000) return 'Вчера';

  return date.toLocaleDateString();
};

export default {
  formatTime,
  formatDateLabel,
};
