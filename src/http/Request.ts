import useAuth from "../store/useAuth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";

const API_URL = import.meta.env.VITE_APP_API_ENDPOINT;
const AUTH_URL = import.meta.env.VITE_APP_AUTH_ENDPOINT;

const refreshTokenPromise = ref<any>("");

const request = {
  _refreshToken: "",
  _refreshFailed: null,

  _accessTokenValidity: null,

  setTokens(accessToken: string, refreshToken: string) {
    const { exp } = jwtDecode(accessToken) as any;
    this._accessTokenValidity = exp;
    this._refreshToken = refreshToken;
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  },

  setSisKey: (sis_key: string) => {
    axios.defaults.headers.common["Sis-Key"] = sis_key;
  },

  api() {
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    api.interceptors.request.use(async (req) => {
      // Token still valid: let the request through unchanged.
      if (Date.now() < (this._accessTokenValidity || 0) * 1000) {
        return req;
      }

      // Token expired. Only one refresh request is sent at a time;
      // concurrent requests await the same shared promise, which resolves
      // to the fresh access token.
      const auth = useAuth();

      if (refreshTokenPromise.value === "") {
        refreshTokenPromise.value = this.auth()
          .post("refresh-token", { token: this._refreshToken })
          .then((response: any) => {
            this.setTokens(response.accessToken, response.refreshToken);
            auth.setTokens(response.accessToken, response.refreshToken, null);
            return response.accessToken as string;
          });
      }

      let accessToken: string;
      try {
        accessToken = await refreshTokenPromise.value;
      } catch (e: any) {
        // Refresh failed (expired refresh token, network error, 5xx, ...).
        // Surface the error instead of falling through with no token.
        if (e?.status === 401) {
          auth.loginExpired();
        }
        return Promise.reject(e);
      } finally {
        // Clear once settled so the next expired request triggers a new
        // refresh. In-flight awaiters already hold the resolved promise.
        refreshTokenPromise.value = "";
      }

      // Apply the refreshed token to THIS request, then let it proceed.
      if (req.headers) {
        req.headers.Authorization = `Bearer ${accessToken}`;
      }
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
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    auth.interceptors.response.use(
      function (response: any) {
        if (response.status === 401) {
          console.log("Should never happen");
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
