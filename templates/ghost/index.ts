import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 2368 }],
      mounts: [
        {
          type: "volume",
          name: "content",
          mountPath: "/var/lib/ghost/content",
        },
      ],
      env: [
        `url=https://$(PRIMARY_DOMAIN)`,
        `database__client=mysql`,
        `database__connection__host=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `database__connection__user=mysql`,
        `database__connection__password=${databasePassword}`,
        `database__connection__database=$(PROJECT_NAME)`,

        `mail__transport=SMTP`,
        `mail__options__host=${input.smtpServerHost}`,
        `mail__options__port=${input.smtpServerPort}`,
        `mail__options__auth__user=${input.smtpServerUsername}`,
        `mail__options__auth__pass=${input.smtpServerPassword}`,
        `mail__from=${input.smtpFromEmail}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
