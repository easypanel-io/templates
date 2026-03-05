import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();

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
          port: 8080,
        },
      ],
      env: [
        `PORT=8080`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
      ].join("\n"),
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-coturn`,
      source: {
        type: "image",
        image: input.coturnServiceImage,
      },
      env: [`DETECT_EXTERNAL_IP=yes`, `DETECT_RELAY_IP=yes`].join("\n"),
      deploy: {
        command: `docker-entrypoint.sh -n --log-file=stdout --redis-userdb="ip=$(PROJECT_NAME)_${input.appServiceName}-redis connect_timeout=30"`,
      },
      ports: [
        {
          published: 3478,
          target: 3478,
          protocol: "tcp",
        },
        {
          published: 3478,
          target: 3478,
          protocol: "udp",
        },
        {
          published: 5349,
          target: 5349,
          protocol: "tcp",
        },
        {
          published: 5349,
          target: 5349,
          protocol: "udp",
        },
      ],
    },
  });

  return { services };
}
