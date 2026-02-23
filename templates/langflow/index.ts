import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `LANGFLOW_DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
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
      serviceName: `${input.appServiceName}-db`,
      image: "postgres:16",
      password: databasePassword,
    },
  });

  return { services };
}
