import useAuth from '@/store/useAuth';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { ref } from 'vue';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
const AUTH_URL = process.env.VUE_APP_AUTH_ENDPOINT;

const refreshTokenPromise = ref<any>("");
const refreshTokenCountAwait = ref<any>("");

const request = {
  _refreshToken: '',
  _refreshFailed: null,

  _accessTokenValidity: null,

  setTokens(accessToken: string, refreshToken: string) {
    const { exp } = jwt_decode(accessToken) as any;
    this._accessTokenValidity = exp;
    this._refreshToken = refreshToken;
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  },

  setSisKey: (sis_key: string) => {
    axios.defaults.headers.common['Sis-Id'] = sis_key;
  },

  api() {
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    api.interceptors.request.use(async (req) => {
      // Test if expired
      if (Date.now() < (this._accessTokenValidity || 0) * 1000) {
        return req;
      }

      // Expired !
      let response: any;
      const auth = useAuth();

      // Check if a refreshToken request has already been sent
      if (refreshTokenPromise.value != '') {
        refreshTokenCountAwait.value++;

        // Await the result of this request
        try {
          return await refreshTokenPromise.value;
        } finally {
          refreshTokenCountAwait.value--;
          if (refreshTokenCountAwait.value == 0) {
            refreshTokenPromise.value = '';
          }
        }
      }

      // Send a refresh token request
      try {
        refreshTokenPromise.value = this.auth().post('refresh-token', {
          token: this._refreshToken,
        });
        response = await refreshTokenPromise.value;
      } catch (e: any) {
        if (e?.status === 401) {
          auth.loginExpired();
          return Promise.reject(e);
        }
      } finally {
        if (refreshTokenCountAwait.value == 0) {
          refreshTokenPromise.value = '';
        }
      }

      // Update 
      this.setTokens(response?.accessToken, response?.refreshToken)
      auth.setTokens(response?.accessToken, response?.refreshToken, null)

      // Update axios
      if (req.headers?.common) {
        req.headers['Authorization'] = `Bearer ${response.accessToken}`;
      }
      this._refreshToken = response.refreshToken;

      return req;
    });

    api.interceptors.response.use(
      (response: any) => {
        if (response.data.error !== undefined) {
          throw response.data.error;
        }
        return response.data?.data || response.data;
      },
      async (error: any) => {
        return Promise.reject(error);
      }
    );

    return api;
  },

  auth: () => {
    const auth = axios.create({
      baseURL: AUTH_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    auth.interceptors.response.use(
      function (response: any) {
        if (response.status === 401) {
          console.log('Should never happen');
          return Promise.reject(response);
        }
        return Promise.resolve(response.data);
      },
      function (error: any) {
        if (error.response?.status === 401) {
          return Promise.reject(error.response);
        }
        // Do something with response error
        return Promise.reject(error.response.data);
      }
    );
    return auth;
  },
};

export default request;
