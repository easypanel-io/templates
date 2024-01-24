import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `CODER_ACCESS_URL=https://$(PRIMARY_DOMAIN)`,
        `CODER_HTTP_ADDRESS=0.0.0.0:80`,
        `CODER_PG_CONNECTION_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: false,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
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
          name: "config",
          mountPath: "/home/coder/.config",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
