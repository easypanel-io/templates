import { Output, Services, randomPassword } from "~templates-utils";
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
      env: [
        `LANGFLOW_DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.appServiceName}-db:5432/${input.projectName}`,
        "LANGFLOW_AUTO_LOGIN=false",
        `LANGFLOW_SUPERUSER=${input.username}`,
        `LANGFLOW_SUPERUSER_PASSWORD=${input.password}`,
      ].join("\n"),
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7860,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/langflow",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-db`,
      image: "postgres:16",
      password: databasePassword,
    },
  });

  return { services };
}
