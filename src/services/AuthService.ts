import Api from "../http/Request.ts";
import type { Sis } from "../models/sis.ts";

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
  sisListe(): Promise<Sis[]> {
    return Api.auth().get("/sis");
  },
  getPermissions(): Promise<unknown[]> {
    return Api.auth().get("/permissions");
  },
};
