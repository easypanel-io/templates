import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbServiceName = `${input.appServiceName}-db`;
  const mongoPassword = randomPassword();
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PORT=8000`,
        `NODE_ENV=production`,
        `SECRET_KEY=${secretKey}`,
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${dbServiceName}:27017/astroluma?authSource=admin`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/storage/uploads",
        },
        {
          type: "volume",
          name: "apps",
          mountPath: "/app/storage/apps",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: dbServiceName,
      password: mongoPassword,
    },
  });

  return { services };
}
