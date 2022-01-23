import moment from 'moment';

export default function useDateFormatter() {
  return {
    formatDate: (date: string|Date, format: string | null) =>
      moment(date).format(format || 'DD.MM.yy'),
  };
}
