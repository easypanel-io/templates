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
        `COLLECTIONS=crowdsecurity/nginx`,
        `GID=1000`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: "",
          mountPath: "/etc/crowdsec/acquis.yaml",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/var/log/nginx",
        },
        {
          type: "volume",
          name: "crowdsec-db",
          mountPath: "/var/lib/crowdsec/data/",
        },
        {
          type: "volume",
          name: "crowdsec-config",
          mountPath: "/etc/crowdsec/",
        },
      ],
    },
  });

  return { services };
} 