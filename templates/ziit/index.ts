import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const pasetoKey = randomString(64);
  const adminKey = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NUXT_DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-postgres:5432/$(PROJECT_NAME)`,
        `NUXT_PASETO_KEY=k4.local.${input.pasetoKey}`,
        `NUXT_GITHUB_CLIENT_ID=${input.githubClientId}`,
        `NUXT_GITHUB_CLIENT_SECRET=${input.githubClientSecret}`,
        `NUXT_GITHUB_REDIRECT_URI=https://$(PRIMARY_DOMAIN)/api/auth/github/callback`,
        `NUXT_HOST=$(PRIMARY_DOMAIN)`,
        `NUXT_DISABLE_REGISTRATION=false`,
        `NUXT_ADMIN_KEY=${adminKey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: databasePassword,
      image: input.postgresServiceImage,
    },
  });

  return { services };
}
