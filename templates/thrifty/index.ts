import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const authPassword = randomString(20);
  const apiDomain =
    input.apiDomain ||
    `https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      env: [`SQLITE_DB_PATH=/data/thrifty.sqlite`, `PORT=8080`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.uiServiceImage,
      },
      env: [
        `CURRENCY_ISO=${input.currencyCode}`,
        `LOCAL_API_PROTOCOL=https`,
        `LOCAL_API_HOSTNAME=${apiDomain}`,
        `LOCAL_API_PORT=443`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      basicAuth: [{ username: "admin", password: authPassword }],
    },
  });

  return { services };
}
