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
      env: [
        `VIRTUAL_HOST=${input.virtualHost}`,
        `HTTPS=OFF`,
        `HTTP_PORT=${input.customHttpPort}`,
        `HTTPS_PORT=${input.customHttpsPort}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/da",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: Number(input.customHttpPort),
        },
      ],
      ports: [
        {
          published: Number(input.smtpRelay),
          target: 25,
          protocol: "tcp",
        },
        {
          published: Number(input.pop3Port),
          target: 110,
          protocol: "tcp",
        },
        {
          published: Number(input.imapPort),
          target: 143,
          protocol: "tcp",
        },
        {
          published: Number(input.smtpPort),
          target: 465,
          protocol: "tcp",
        },
        {
          published: Number(input.smtpsPort),
          target: 587,
          protocol: "tcp",
        },
        {
          published: Number(input.secureImapPort),
          target: 993,
          protocol: "tcp",
        },
        {
          published: Number(input.securePop3Port),
          target: 995,
          protocol: "tcp",
        },
        {
          published: Number(input.emailFilterPort),
          target: 4190,
          protocol: "tcp",
        },
      ],
    },
  });

  return { services };
}
