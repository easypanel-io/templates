import {
    Output,
    randomString,
    Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const betterAuthSecret = randomString(64);
  const encryptionKey = randomString(64);

  const env = [
    `BETTER_AUTH_SECRET=${input.betterAuthSecret || betterAuthSecret}`,
    `ENCRYPTION_KEY=${input.encryptionKey || encryptionKey}`,
    `TRUSTED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
    `COMMERCIAL_MODE=${input.commercialMode || "false"}`,
  ];

  if (input.googleClientId) {
    env.push(`GOOGLE_CLIENT_ID=${input.googleClientId}`);
  }
  if (input.googleClientSecret) {
    env.push(`GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`);
  }
  if (input.microsoftClientId) {
    env.push(`MICROSOFT_CLIENT_ID=${input.microsoftClientId}`);
  }
  if (input.microsoftClientSecret) {
    env.push(`MICROSOFT_CLIENT_SECRET=${input.microsoftClientSecret}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: env.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  return { services };
}
