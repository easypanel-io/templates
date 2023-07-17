import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `BP_PRODUCTION=true`,
    `BPFS_STORAGE=database`,
    `EXTERNAL_URL=https://$(PRIMARY_DOMAIN)`,
  ];

  if (input.enableLangServer) {
    appEnv.push(
      `BP_MODULE_NLU_LANGUAGESOURCES='[{ "endpoint": "http://$(PROJECT_NAME)_$(SERVICE_NAME)-lang:3100" }]'`
    );
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.appServiceName + "-lang",
        source: { type: "image", image: input.appServiceImage },
        domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3100 }],
        deploy: { command: "./bp lang --langDir /botpress/data/embeddings" },
        mounts: [
          {
            type: "bind",
            hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/data`,
            mountPath: "/botpress/data",
          },
        ],
      },
    });
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      deploy: { command: "./bp & ./duckling -p 8000" },
      mounts: [{ type: "volume", name: "data", mountPath: "/botpress/data" }],
      env: appEnv.join("\n"),
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
