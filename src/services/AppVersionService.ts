import Api from "../http/Request.ts";

export default {
  getLatestVersion(): Promise<{ version: string | null }> {
    return Api.auth().get("/mobile/latest-version");
  },
};
