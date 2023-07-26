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
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_USER=mariadb`,
        `DB_PASS=${databasePassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `ADMIN_USER=${input.limesurveyUsername}`,
        `ADMIN_PASS=${input.limesurveyPassword}`,
        `DEBUG=FALSE`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/www/html/upload",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/www/logs",
        },
        {
          type: "volume",
          name: "custom-assets",
          mountPath: "/assets/custom",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
