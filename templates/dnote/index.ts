import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

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
          port: 3001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dnote-data",
          mountPath: "/data",
        },
      ],
      env: [
        `GO_ENV=PRODUCTION`,
        `DBPath=/data/dnote.db`,
        `BaseURL=https://$(PRIMARY_DOMAIN)`,
        `SmtpHost=${input.SmtpHost}`,
        `SmtpPort=${input.SmtpPort}`,
        `SmtpUsername=${input.SmtpUser}`,
        `SmtpPassword=${input.SmtpPassword}`,
        `SmtpFrom=${input.SmtpFrom}`,
      ].join("\n"),
    },
  });

  return { services };
}
