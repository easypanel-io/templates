import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const valkeyServiceName = `${input.appServiceName}-valkey`;
  const valkeyPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `VALKEY_URL=redis://:${valkeyPassword}@$(PROJECT_NAME)-${valkeyServiceName}:6379`,
        `FORWARDED_ALLOW_IPS=*`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: valkeyServiceName,
      image: input.valkeyServiceImage,
      password: valkeyPassword,
      command: `valkey-server --requirepass ${valkeyPassword}`,
    },
  });

  return { services };
}
