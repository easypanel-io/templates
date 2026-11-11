import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const arrWaitTime = input.arrWaitTime ?? 300;
  const runTime = input.runTime?.trim() || "disabled";
  const timezone = input.timezone?.trim() || "UTC";
  const disableUiEnv = input.disableUi ? ["DISABLE_UI=true"] : [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `TZ=${timezone}`,
        "TERM=xterm",
        `RUN_TIME=${runTime}`,
        `ARR_WAIT_TIME=${arrWaitTime}`,
        `GENESIS_JWT_SECRET=${randomString(64)}`,
        `APP_PORT=8000`,
        ...disableUiEnv,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/config/Logs",
        },
        {
          type: "volume",
          name: "temp",
          mountPath: "/config/temp",
        },
        {
          type: "volume",
          name: "assets",
          mountPath: "/assets",
        },
        {
          type: "volume",
          name: "assetsbackup",
          mountPath: "/assetsbackup",
        },
        {
          type: "volume",
          name: "manualassets",
          mountPath: "/manualassets",
        },
      ],
    },
  });

  return { services };
}
