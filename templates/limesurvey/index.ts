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
      proxy: { port: 8080, secure: true },
      env: [
        `DB_TYPE=${input.databaseType === "postgres" ? "pgsql" : "mysql"}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=${input.databaseType === "postgres" ? "5432" : "3306"}`,
        `DB_NAME=${input.projectName}`,
        `DB_USERNAME=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
        `ADMIN_USER=${input.limesurveyUsername || "admin"}`,
        `ADMIN_PASSWORD=${input.limesurveyPassword || randomPassword()}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "upload",
          mountPath: "/var/www/html/upload",
        },
        {
          type: "volume",
          name: "assets",
          mountPath: "/var/www/html/assets",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/var/www/html/application/logs",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/var/www/html/application/config",
        },
      ],
    },
  });

  services.push({
    type: input.databaseType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
      image:
        input.databaseType === "postgres"
          ? "postgres:13"
          : input.databaseType === "mariadb"
          ? "mariadb:10"
          : input.databaseType === "mysql"
          ? "mysql:8"
          : input.databaseType + ":latest",
    },
  });

  return { services };
}
