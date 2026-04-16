import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `TWINGATE_NETWORK=${input.twingateNetwork}`,
    `TWINGATE_ACCESS_TOKEN=${input.twingateAccessToken}`,
    `TWINGATE_REFRESH_TOKEN=${input.twingateRefreshToken}`,
    `TWINGATE_LOG_ANALYTICS=${input.twingateLogAnalytics}`,
    `TWINGATE_LOG_LEVEL=${input.twingateLogLevel}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: appEnv.join("\n"),
    },
  });

  return { services };
}
