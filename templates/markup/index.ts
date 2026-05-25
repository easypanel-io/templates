import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const cookiePassword = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `WORKOS_CLIENT_ID=${input.workosClientId}`,
        `WORKOS_API_KEY=${input.workosApiKey}`,
        `WORKOS_COOKIE_PASSWORD=${cookiePassword}`,
        `NEXT_PUBLIC_WORKOS_REDIRECT_URI=${input.workosRedirectUri}`,
        `NEXT_PUBLIC_SITE_URL=https://$(EASYPANEL_DOMAIN)`,
        `NEXT_PUBLIC_DB_PROVIDER=postgres`,
        `NODE_ENV=production`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
