import useAuth from "../store/useAuth.ts";
import axios, { type AxiosResponse, type AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";

const API_URL = import.meta.env.VITE_APP_API_ENDPOINT;
const AUTH_URL = import.meta.env.VITE_APP_AUTH_ENDPOINT;

const refreshTokenPromise = ref<Promise<string> | string>("");

const request = {
  _refreshToken: "",
  _refreshFailed: null,

  _accessTokenValidity: null as number | null,

  setTokens(accessToken: string, refreshToken: string) {
    const { exp } = jwtDecode<{ exp: number }>(accessToken);
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
          .then((res) => {
            const response = res as unknown as {
              accessToken: string;
              refreshToken: string;
            };
            this.setTokens(response.accessToken, response.refreshToken);
            auth.setTokens(response.accessToken, response.refreshToken, null);
            return response.accessToken;
          });
      }

      let accessToken: string;
      try {
        accessToken = await refreshTokenPromise.value;
      } catch (e: unknown) {
        // Refresh failed (expired refresh token, network error, 5xx, ...).
        // Surface the error instead of falling through with no token.
        if ((e as { status?: number })?.status === 401) {
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
      (response: AxiosResponse) => {
        if (response.data.error !== undefined) {
          throw response.data.error;
        }
        return response.data?.data || response.data;
      },
      async (error: AxiosError) => {
        return Promise.reject(error);
      },
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
      function (response: AxiosResponse) {
        if (response.status === 401) {
          console.log("Should never happen");
          return Promise.reject(response);
        }
        return Promise.resolve(response.data);
      },
      function (error: AxiosError) {
        if (error.response?.status === 401) {
          return Promise.reject(error.response);
        }
        // Do something with response error
        return Promise.reject(error.response?.data);
      },
    );
    return auth;
  },
};

export default request;
