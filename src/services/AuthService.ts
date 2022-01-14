import Api from '@/http/Request';

export default {
  login(payload : any) {
    return Api.auth().post('/login', payload);
  },
  register(credentials: any) {
    return Api.auth().post('/register', credentials);
  },
  useToken(token: string) {
    return Api.auth().post('/use-token', { token });
  },
  confirmation(token: string) {
    return Api.auth().post('/confirmer-email', { token });
  },
  newRegisterToken(tokenInfo: string) {
    return Api.auth().post('/register-token', tokenInfo);
  },
  refreshToken(payload: string) {
    return Api.auth().post('refresh-token', { token: payload });
  },
  updateUserRoles(user: any) {
    return Api.auth().post('users/' + user.id + '/roles', {
      roles: user.roles,
    });
  },
  createRole(role: any) {
    return Api.auth().post('roles', role);
  },
  updateRole(role: any) {
    return Api.auth().put('roles/' + role.id, role);
  },
  deleteRole(roleId: number) {
    return Api.auth().delete('roles/' + roleId);
  },
  sisListe() {
    return Api.auth().get('sis');
  },
  getPermissions() {
    return Api.auth().get('permissions');
  },
  getRoles() {
    return Api.auth().get('roles');
  },
  getUsers() {
    return Api.auth().get('users');
  },
};
