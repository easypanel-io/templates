import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `TZ=Europe/Vienna`,
        `NEKO_ROOMS_MUX=true`,
        `NEKO_ROOMS_EPR=59000-59049`,
        `NEKO_ROOMS_NAT1TO1=127.0.0.1`,
        `NEKO_ROOMS_INSTANCE_URL=http://127.0.0.1:8080/`,
        `NEKO_ROOMS_INSTANCE_NETWORK=neko-rooms-net`,
        `NEKO_ROOMS_TRAEFIK_ENABLED=false`,
        `NEKO_ROOMS_PATH_PREFIX=/room/`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  return { services };
}
