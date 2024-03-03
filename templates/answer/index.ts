import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [`AUTO_INSTALL=${input.autoInstall}`];

  if (input.autoInstall) {
    const databasePassword = randomPassword();
    appEnv.push(
      `LANGUAGE=${input.language || "en-US"}`,
      `SITE_NAME=${input.siteName || "Answer"}`,
      `SITE_URL=${input.siteUrl === "answer.apache.org" ? "https://$(EASYPANEL_DOMAIN)" : "https://" + input.siteUrl}`,
      `ADMIN_NAME=${input.adminName}`,
      `ADMIN_PASSWORD=${input.adminPassword}`,
      `ADMIN_EMAIL=${input.adminMail}`,
      `CONTACT_EMAIL=${input.contactMail}`,
      `DB_TYPE=${input.databaseType === "mariadb" ? "mysql" : input.databaseType}`,
    );
    if (input.databaseType !== "sqlite3") {
      appEnv.push(
        `DB_USERNAME=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_NAME=$(PROJECT_NAME)`,
      );
      services.push({
        type: input.databaseType,
        data: {
          projectName: input.projectName,
          serviceName: input.databaseServiceName,
          password: databasePassword,
        },
      });
    } else {
      appEnv.push(`DB_FILE=/data/answer.db`);
    }
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: { command: "sleep 15; /entrypoint.sh" },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "answer-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
