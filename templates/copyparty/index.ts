import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const adminPassword = input.adminPassword || randomPassword();

  const copypartyConf = `[global]
  e2dsa
  e2ts
  xff-src: lan
  rproxy: -1

[accounts]
  ${input.adminUsername}: ${adminPassword}

[/]
  /w
  accs:
    rwmda: ${input.adminUsername}
  flags:
    e2ds
`;

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
          port: 3923,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/w",
        },
        {
          type: "file",
          content: copypartyConf,
          mountPath: "/cfg/copyparty.conf",
        },
      ],
    },
  });

  return { services };
}
