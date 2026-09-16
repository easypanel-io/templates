import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const httpPort = 7080;
  const databaseUrl = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`;

  const env = [
    `CODER_ACCESS_URL=https://$(PRIMARY_DOMAIN)`,
    `CODER_HTTP_ADDRESS=0.0.0.0:${httpPort}`,
    `CODER_PG_CONNECTION_URL=${databaseUrl}`,
  ];

  const domains = [
    { host: "$(EASYPANEL_DOMAIN)", port: httpPort, wildcard: false },
  ];

  if (input.wildcardDomain) {
    env.push(`CODER_WILDCARD_ACCESS_URL=https://*.${input.wildcardDomain}`);
    domains.push({
      host: input.wildcardDomain,
      port: httpPort,
      wildcard: true,
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: env.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        groups: [input.dockerGroupId],
      },
      domains,
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/home/coder/.config",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
