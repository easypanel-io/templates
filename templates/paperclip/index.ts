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
  const authSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `PORT=3100`,
        `SERVE_UI=true`,
        `BETTER_AUTH_SECRET=${authSecret}`,
        `PAPERCLIP_PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
        `PAPERCLIP_DEPLOYMENT_MODE=authenticated`,
        `PAPERCLIP_DEPLOYMENT_EXPOSURE=private`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3100,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/paperclip",
        },
      ],
      scripts: [
        {
          name: "Onboard",
          script: "pnpm paperclipai onboard",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
