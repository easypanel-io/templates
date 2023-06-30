import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(64);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `TRUST_PROXY=0`,
        `BASE_URL=https://${input.domain}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `SECRET_KEY=${secret}`,
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
      mounts: [
        {
          type: "volume",
          name: "user-avatars",
          mountPath: "/app/public/user-avatars",
        },
        {
          type: "volume",
          name: "project-background-images",
          mountPath: "/app/public/project-background-images",
        },
        {
          type: "volume",
          name: "attachments",
          mountPath: "/app/private/attachments"
        }
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
