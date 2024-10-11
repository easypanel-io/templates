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
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      deploy: {
        command: "komiser start",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "backup",
          mountPath: "/backup",
        },
        {
          type: "file",
          content: [
            "[postgres]",
            `uri=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
          ].join("\n"),
          mountPath: "/data/config.toml",
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
