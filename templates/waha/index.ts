import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const apiKey = randomString(32);
  const dashboardPassword = randomString(32);

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
          port: 3000,
        },
      ],
      env: [
        `WAHA_API_KEY=${apiKey}`,
        `WAHA_DASHBOARD_USERNAME=${input.dashboardUsername}`,
        `WAHA_DASHBOARD_PASSWORD=${dashboardPassword}`,
        `WHATSAPP_SWAGGER_USERNAME=${input.swaggerUsername}`,
        `WHATSAPP_SWAGGER_PASSWORD=${dashboardPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "sessions",
          mountPath: "/app/.sessions",
        },
      ],
    },
  });

  return { services };
}
