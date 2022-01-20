import moment from 'moment';

export default function useDateFormatter() {
  return {
    formatDate: (date: string, format: string | null) =>
      moment(date).format(format || 'DD.MM.yy'),
  };
}
