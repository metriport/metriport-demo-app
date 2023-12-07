import { MetriportMedicalApi } from "@metriport/api-sdk";

import { Config } from "../shared/config";

export const metriportClient = new MetriportMedicalApi(
  Config.getMetriportApiKey(),
  { sandbox: !Config.isProdEnv() }
);
