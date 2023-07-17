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
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      mounts: [{ type: "volume", name: "data", mountPath: "/botpress/data" }],
      deploy: { command: "sleep 10; ./bp" },
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `BP_MODULE_NLU_DUCKLINGURL=http://$(PROJECT_NAME)_$(SERVICE_NAME)-module:8000`,
        `BP_MODULE_NLU_LANGUAGESOURCES='[{ "endpoint": "http://$(PROJECT_NAME)_$(SERVICE_NAME)-module:3100" }]'`,
        `BP_PRODUCTION=true`,
        `BPFS_STORAGE=database`,
        `EXTERNAL_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName + "-module",
      source: { type: "image", image: input.appServiceImage },
      mounts: [{ type: "volume", name: `lang`, mountPath: "/botpress/lang" }],
      deploy: {
        command:
          "./duckling -p 8000 & ./bp lang --langDir /botpress/lang --port 3100",
      },
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
