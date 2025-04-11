import Api from "../http/Request";
import type { ExcuseType } from "../models/excusetype";

export default {
  getExcuses(): Promise<ExcuseType[]> {
    return Api.api().get("/excuses-types");
  },
};
