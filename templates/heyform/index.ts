import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const randomKey1 = randomString(32);
  const randomKey2 = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_HOMEPAGE_URL=https://$(PRIMARY_DOMAIN)`,
        `SESSION_KEY=${randomKey1}`,
        `FORM_ENCRYPTION_KEY=${randomKey2}`,
        `MONGO_URI=mongodb://$(PROJECT_NAME)_${input.appServiceName}-db:27017/heyform`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `GOOGLE_RECAPTCHA_KEY=${input.googleRecaptchaKey}`,
        `GOOGLE_RECAPTCHA_SECRET=${input.googleRecaptchaSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: input.databaseServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/db",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      source: {
        type: "image",
        image: input.redisServiceImage,
      },
    },
  });

  return { services };
}
