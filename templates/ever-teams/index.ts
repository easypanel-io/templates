import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `SMTP_FROM_ADDRESS=${input.smtpFromAddress}`,
        `SMTP_HOST=${input.smtpHost}`,
        `SMTP_PORT=${input.smtpPort}`,
        `SMTP_SECURE=${input.smtpSecure}`,
        `SMTP_USERNAME=${input.smtpUsername}`,
        `SMTP_PASSWORD=${input.smtpPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
