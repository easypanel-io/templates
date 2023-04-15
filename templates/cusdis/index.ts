import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `USERNAME=${input.username}`,
        `PASSWORD=${input.password}`,
        `NEXTAUTH_URL=https://${input.domain}`,
        `DB_TYPE=pgsql`,
        `DB_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `JWT_SECRET=${secret}`,
        `IS_HOSTED=true`,
        `NODE_ENV=production`,
        `HOST=https://${input.domain}`,
        `SMTP_SENDER=Cusdis Notification<notification@${input.domain}>`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
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
