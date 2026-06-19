import Api from '../http/Request.ts';

export default {
  getTraitements(): Promise<unknown[]> {
    return Api.api().get('/intervention-traitement');
  },
};
