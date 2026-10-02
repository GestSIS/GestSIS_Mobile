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
  // 2FA — échange un pre-auth token (login sur un compte déjà protégé) contre
  // la session complète.
  verifyTwoFactor(preAuthToken: string, code: string): Promise<unknown> {
    return Api.authWithToken(preAuthToken).post("2fa/verify", { code });
  },
  getWebauthnLoginChallenge(preAuthToken: string): Promise<unknown> {
    return Api.authWithToken(preAuthToken).post("2fa/webauthn/challenge");
  },
  verifyWebauthnLogin(preAuthToken: string, response: unknown): Promise<unknown> {
    return Api.authWithToken(preAuthToken).post("2fa/webauthn/verify", { response });
  },
  logout(refreshToken: string): Promise<unknown> {
    return Api.auth().post("/logout", { token: refreshToken });
  },
};
