import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const password = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DATA_FOLDER=data`,
        `WEB_VAULT_FOLDER=web-vault/`,
        `WEB_VAULT_ENABLED=true`,
        `SENDS_ALLOWED=true`,
        `EMERGENCY_ACCESS_ALLOWED=true`,
        `DISABLE_2FA_REMEMBER=false`,
        `EMAIL_ATTEMPTS_LIMIT=3`,
        `SIGNUPS_ALLOWED=true`,
        `ADMIN_TOKEN=${password}`,
        `DISABLE_ADMIN_TOKEN=false`,
        `SHOW_PASSWORD_HINT=false`,
        `PASSWORD_HINTS_ALLOWED=true`,
        `DOMAIN=https://$(PRIMARY_DOMAIN)`,
        `SMTP_DEBUG=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "web-vault",
          mountPath: "/web-vault",
        },
      ],
    },
  });

  return { services };
}
