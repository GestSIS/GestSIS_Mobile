import Api from "../http/Request";
import { ExcuseParam } from "../models/bundle";

export default {
  getParams(): Promise<ExcuseParam> {
    return Api.api().get("/excuse-param");
  },
};
