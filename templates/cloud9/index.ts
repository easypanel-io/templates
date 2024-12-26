import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=Europe/London`,
        `GITURL=https://github.com/linuxserver/docker-cloud9.git`,
        `USERNAME=${input.username}`,
        `PASSWORD=${input.password}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "code",
          mountPath: "/code",
        },
      ],
    },
  });

  return { services };
}
