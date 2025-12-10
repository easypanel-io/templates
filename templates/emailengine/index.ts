import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const encryptionKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `EENGINE_SETTINGS={"smtpServerEnabled":true,"smtpServerPort":${input.smtpMessageSubmission},"smtpServerHost":"0.0.0.0","smtpServerAuthEnabled":true,"smtpServerPassword":"${input.smtpPassword}"}`,
        `EENGINE_SECRET=${encryptionKey}`,
        `EENGINE_REDIS=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/2`,
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
      ports: [
        {
          published: Number(input.imapPort),
          target: 9993,
          protocol: "tcp",
        },
        {
          published: Number(input.smtpMessageSubmission),
          target: 2525,
          protocol: "tcp",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
