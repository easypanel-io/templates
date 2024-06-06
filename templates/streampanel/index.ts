import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secret = randomPassword();

  const env = [
    "# https://github.com/wish-oss/stream-panel/tree/dev?tab=readme-ov-file#setup-environment-variables",
    "",
    "GITHUB_ID=your-github-id",
    "GITHUB_SECRET=your-github-secret",
    "",
    `NEXTAUTH_SECRET=${secret}`,
    "NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)",
    "",
    `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_postgres:5432/${input.projectName}`,
    "",
    "EASYPANEL_URL=https://your-easypanel.url",
    "EASYPANEL_API_KEY=your-easypanel-apikey",
    "",
    "GOOGLE_CLIENT_ID=___.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET=your-google-secret",
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "wish-oss",
        repo: "stream-panel",
        ref: "dev",
        path: "/",
        autoDeploy: true,
      },
      build: {
        type: "nixpacks",
      },
      env: env.join("\n"),
      deploy: {
        replicas: 1,
        command: "npx prisma migrate deploy && npm run start",
        zeroDowntime: true,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: "postgres",
      image: "postgres:16",
      password: databasePassword,
    },
  });

  return { services };
}
