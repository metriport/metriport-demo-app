import { Application } from "express";
import { processAuthorization } from "./middlewares/auth";
import example from "./example";
import webhook from './webhook';

export default (app: Application) => {
  app.use("/example", processAuthorization, example);
  app.use("/webhook", webhook);
};
