import Api from "../http/Request.ts";

export default {
  // Api.auth() resolves with the raw response body (unlike Api.api(), it does
  // not unwrap the `data` envelope), so it must be unwrapped here.
  getLatestVersion(): Promise<{ version: string | null }> {
    return Api.auth()
      .get("/mobile/latest-version")
      .then(
        (res) => (res as unknown as { data: { version: string | null } }).data,
      );
  },
};
