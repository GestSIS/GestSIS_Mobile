import { DateTime } from 'luxon';

export default function useDateFormatter() {
  return {
    formatDate: (date: string, format: string | null) => {
      return DateTime.fromSQL(date).toFormat(format || 'dd.LL.yy')
    },
  };
}
