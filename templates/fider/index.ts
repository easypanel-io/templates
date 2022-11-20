import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `BASE_URL=https://${input.domain}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.databaseServiceName}?sslmode=disable`,
        `JWT_SECRET=${secret}`,
        `EMAIL_NOREPLY=${input.emailNoReply}`,
        `EMAIL_SMTP_HOST=${input.emailHost}`,
        `EMAIL_SMTP_PORT=${input.emailPort}`,
        `EMAIL_SMTP_USERNAME=${input.emailUsername}`,
        `EMAIL_SMTP_PASSWORD=${input.emailPassword}`,
        `EMAIL_SMTP_ENABLE_STARTTLS=true`,


      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
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
