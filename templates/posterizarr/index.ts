import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const arrWaitTime = input.arrWaitTime ?? 300;
  const runTime = input.runTime?.trim() || "disabled";
  const timezone = input.timezone?.trim() || "UTC";
  const disableUiEnv = input.disableUi ? ["DISABLE_UI=true"] : [];
  const volumes = [
    { name: "config", mountPath: "/config" },
    { name: "logs", mountPath: "/config/Logs" },
    { name: "temp", mountPath: "/config/temp" },
    { name: "assets", mountPath: "/assets" },
    { name: "assetsbackup", mountPath: "/assetsbackup" },
    { name: "manualassets", mountPath: "/manualassets" },
  ];

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
      mounts: volumes.map((volume) => ({
        type: "volume" as const,
        ...volume,
      })),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-permissions`,
      source: {
        type: "image",
        image: "busybox:1.37",
      },
      deploy: {
        command: "chown -R 65534:65533 /volumes && exec sleep 2147483647",
      },
      mounts: volumes.map((volume) => ({
        type: "bind" as const,
        hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/${volume.name}`,
        mountPath: `/volumes/${volume.name}`,
      })),
    },
  });

  return { services };
}
