import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = input.adminPassword || randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_URL=${input.appDomain}`,
        `SSH_PORT=${input.sshPort}`,
        `WEB_PORT=80`,
        `ADMIN_PASS=${adminPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      ports: [
        {
          published: input.sshPort,
          target: 22,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "bbs-data",
          mountPath: "/var/bbs",
        },
      ],
    },
  });

  return { services };
}
