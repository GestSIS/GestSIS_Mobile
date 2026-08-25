import Api from "../http/Request.ts";

export default {
  login(payload: Record<string, unknown>): Promise<unknown> {
    return Api.auth().post("/login", payload);
  },
  register(credentials: Record<string, unknown>): Promise<unknown> {
    return Api.auth().post("/register", credentials);
  },
  refreshToken(payload: string): Promise<unknown> {
    return Api.auth().post("/refresh-token", { token: payload });
  },
  getPermissions(): Promise<unknown[]> {
    return Api.auth().get("/permissions");
  },
};
