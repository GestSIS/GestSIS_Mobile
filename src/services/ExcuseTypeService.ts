import Api from "../http/Request.ts";
import type { ExcuseType } from "../models/excusetype.ts";

export default {
  getExcuses(): Promise<ExcuseType[]> {
    return Api.api().get("/excuses-types");
  },
};
