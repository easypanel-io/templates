import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configJsonFile = `{
  "client": {
    "token": {
      "hmac_secret_key": "${input.hmacSecretKey}"
    },
    "allowed_origins": ["*"]
  },
  "http_api": {
    "key": "${input.apiKey}"
  },
  "admin": {
    "password": "${input.adminPassword}",
    "secret": "${input.adminSecret}",
    "enabled": true
  }
}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "centrifugo -c config.json",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "file",
          content: configJsonFile,
          mountPath: "/centrifugo/config.json",
        },
      ],
    },
  });

  return { services };
}
