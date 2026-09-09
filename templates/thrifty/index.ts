import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const authPassword = randomString(20);
  const apiServiceName = `${input.appServiceName}-api`;
  const caddyServiceName = `${input.appServiceName}-proxy`;

  const caddyfile = `:80 {
  handle /api* {
    reverse_proxy $(PROJECT_NAME)_${apiServiceName}:8080
  }

  handle /swagger* {
    reverse_proxy $(PROJECT_NAME)_${apiServiceName}:8080
  }

  handle {
    reverse_proxy $(PROJECT_NAME)_${input.appServiceName}:8080
  }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: apiServiceName,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      env: [`SQLITE_DB_PATH=/data/thrifty.sqlite`, `PORT=8080`].join("\n"),
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
      env: [`CURRENCY_ISO=${input.currencyCode}`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: caddyServiceName,
      source: {
        type: "image",
        image: "caddy:2.10-alpine",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      basicAuth: [{ username: "admin", password: authPassword }],
      mounts: [
        {
          type: "file",
          content: caddyfile,
          mountPath: "/etc/caddy/Caddyfile",
        },
      ],
    },
  });

  return { services };
}
