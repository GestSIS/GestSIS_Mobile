import Api from '../http/Request';
import type { Sis } from '../models/sis.ts';

export default {
  login(payload: any): Promise<any> {
    return Api.auth().post('/login', payload);
  },
  register(credentials: any): Promise<any> {
    return Api.auth().post('/register', credentials);
  },
  refreshToken(payload: string): Promise<any> {
    return Api.auth().post('/refresh-token', { token: payload });
  },
  sisListe(): Promise<Sis[]> {
    return Api.auth().get('/sis');
  },
  getPermissions(): Promise<any[]> {
    return Api.auth().get('/permissions');
  },
};
