import axios from 'axios';

const API_URL = process.env.VUE_APP_API_ENDPOINT;
const AUTH_URL = process.env.VUE_APP_AUTH_ENDPOINT;

// console.log(API_URL)
// console.log(AUTH_URL)
// import store from '@/store';

const request = {
  _401interceptor: true,
  _refreshToken: null,
  _refreshFailed: null,

  setAccessToken: (token:string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  setSisKey: (sis_key:string) => {
    axios.defaults.headers.common['Sis-Id'] = sis_key;
  },

  apiFileDownload(filename:string) {
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

    api.interceptors.response.use(
      (response: any) => {
        if (response.data.error !== undefined) {
          throw response.data.error;
        }
        return response.data?.data || response.data;
      },
      async (error: any) => {
        if (error.config && error.response && error.response.status === 401) {
          // Refresh the access token
          try {
            //TODO: refresh token
            // await store.dispatch('refreshToken');

            error.config.headers.Authorization = `Bearer ${axios.defaults.headers.common['Authorization']}`;

            // Retry the original request
            return axios({
              method: error.config.method,
              url: error.config.url,
              data: error.config.data,
            }).then((response: any) => {
              return response.data.data;
            });
          } catch (e: any) {
            // Refresh has failed - reject the original request
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );

    return api;
  },

  auth: () => {
    // console.log("Create auth")
    // console.log(axios.defaults.headers.common)
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
          throw response.data;
        }
        return response.data;
      },
      function (error: any) {
        // console.log(error);
        // Do something with response error
        return Promise.reject(error.response.data);
      }
    );
    // console.log("Return auth")
    return auth;
  },
};

export default request;
