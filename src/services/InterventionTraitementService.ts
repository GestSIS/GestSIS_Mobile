import Api from '@/http/Request';

export default {
  getTraitements(): Promise<any[]> {
    return Api.api().get('/intervention-traitement');
  },
};
