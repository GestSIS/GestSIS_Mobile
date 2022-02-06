import { DateTime } from 'luxon';

export default function useDateFormatter() {
  return {
    formatDate: (date: string, format: string | null) =>
    DateTime.fromISO(date).toFormat(format || 'DD.MM.yy'),
  };
}
