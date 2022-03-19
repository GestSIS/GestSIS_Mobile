import useAuth from '@/store/useAuth';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
const AUTH_URL = process.env.VUE_APP_AUTH_ENDPOINT;

// console.log(API_URL)
// console.log(AUTH_URL)
// import store from '@/store';

const refreshTokenPromise = ref<any>("");
const refreshTokenCountAwait = ref<any>("");

const request = {
  _refreshToken: '',
  _refreshFailed: null,

  _accessTokenValidity: null,

  setTokens(acccessToken: string, refreshToken: string) {
    const { exp } = jwt_decode(acccessToken) as any;
    this._accessTokenValidity = exp;
    this._refreshToken = refreshToken;
    axios.defaults.headers.common['Authorization'] = `Bearer ${acccessToken}`;
  },

  setSisKey: (sis_key: string) => {
    axios.defaults.headers.common['Sis-Id'] = sis_key;
  },

  apiFileDownload(filename: string) {
    const api = axios.create({
      baseURL: API_URL,
      responseType: 'arraybuffer', //TODO: next fix this bug to be able to handle error message in json format
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    api.interceptors.response.use(
      function (response: any) {
        return response;
      },
      function (error: any) {
        throw error.response.data;
      }
    );

    if (filename) {
      api.interceptors.response.use((response: any) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // link.target = '_blank' // If we want to open it in another tab
        link.setAttribute('download', filename);
        // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
        link.click();
        window.URL.revokeObjectURL(url);
        return response.data;
      });
    }

    return api;
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
          auth.logout();
          useRouter().push({ name: 'login' })
          return Promise.reject(e);
        }
      } finally {
        if (refreshTokenCountAwait.value == 0) {
          refreshTokenPromise.value = '';
        }
      }

      // Update store
      auth.state.data.accessToken = response?.accessToken;
      auth.state.data.refreshToken = response?.refreshToken;
      auth.persist();

      // Update axios
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${response.accessToken}`;
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
        console.error(error);
        // Do something with response error
        return Promise.reject(error.response.data);
      }
    );
    return auth;
  },
};

export default request;
