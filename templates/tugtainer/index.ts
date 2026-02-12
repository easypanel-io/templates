import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const socketProxyEnv = [
    `CONTAINERS=${input.socketProxyContainers || "1"}`,
    `EVENTS=${input.socketProxyEvents || "1"}`,
    `IMAGES=${input.socketProxyImages || "1"}`,
    `INFO=${input.socketProxyInfo || "1"}`,
    `LOG_LEVEL=${input.socketProxyLogLevel || "warning"}`,
    `PING=${input.socketProxyPing || "1"}`,
    `NETWORKS=${input.socketProxyNetworks || "1"}`,
    `POST=${input.socketProxyPost || "1"}`,
    `TZ=${input.timezone}`,
    `VERSION=${input.socketProxyVersion || "1"}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-socket-proxy`,
      source: {
        type: "image",
        image: input.socketProxyImage,
      },
      env: socketProxyEnv.join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `DOCKER_HOST=tcp://$(PROJECT_NAME)_${input.appServiceName}-socket-proxy:2375`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/tugtainer",
        },
      ],
    },
  });

  return { services };
}
