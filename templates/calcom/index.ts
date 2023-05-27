import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appEnv = [
    `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
    `NEXTAUTH_SECRET=${btoa(randomString(32))}`,
    `CALENDSO_ENCRYPTION_KEY=${btoa(randomString(24))}`,
  ];
  if (input.domain) {
    appEnv.push(`NEXT_PUBLIC_WEBAPP_URL=https://${input.domain}`);
  }

  if (input.enableStudio) {
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.appServiceName + "-studio",
        source: { type: "image", image: input.appServiceImage },
        proxy: { port: 5555, secure: true },
        deploy: { command: "npx prisma studio" },
        env: [
          `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        ].join("\n"),
      },
    });
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 3000, secure: true },
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
