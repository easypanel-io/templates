import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const hostname = input.hostname ?? "$(EASYPANEL_DOMAIN)";
  const enableFail2ban = input.enableFail2ban;
  const enableClamav = input.enableClamav;
  const enableRspamd = input.enableRspamd;

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `OVERRIDE_HOSTNAME=${hostname}`,
        `ENABLE_CLAMAV=${enableClamav ? "1" : "0"}`,
        `ENABLE_FAIL2BAN=${enableFail2ban ? "1" : "0"}`,
        `ENABLE_RSPAMD=${enableRspamd ? "1" : "0"}`,
      ].join("\n"),
      deploy: {
        capAdd: ["NET_ADMIN"],
      },
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      ports: [
        {
          published: 25,
          target: 25,
          protocol: "tcp",
        },
        {
          published: 143,
          target: 143,
          protocol: "tcp",
        },
        {
          published: 465,
          target: 465,
          protocol: "tcp",
        },
        {
          published: 587,
          target: 587,
          protocol: "tcp",
        },
        {
          published: 993,
          target: 993,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "mail-data",
          mountPath: "/var/mail/",
        },
        {
          type: "volume",
          name: "mail-state",
          mountPath: "/var/mail-state/",
        },
        {
          type: "volume",
          name: "mail-logs",
          mountPath: "/var/log/mail/",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/tmp/docker-mailserver/",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
    },
  });

  return { services };
}
