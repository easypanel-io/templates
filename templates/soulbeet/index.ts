import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const slskdApiKey = input.slskdApiKey || randomPassword();

  if (input.enableSlskd) {
    services.push({
      type: "app",
      data: {
        serviceName: `${input.appServiceName}-slskd`,
        source: {
          type: "image",
          image: "slskd/slskd:latest",
        },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 5030,
          },
        ],
        env: [
          `SLSKD_REMOTE_CONFIGURATION=true`,
          `SLSKD_SLSK_LISTEN_PORT=50300`,
        ].join("\n"),
        mounts: [
          {
            type: "volume",
            name: "slskd-config",
            mountPath: "/app",
          },
          {
            type: "volume",
            name: "downloads",
            mountPath: "/app/downloads",
          },
        ],
        ports: [
          {
            published: 50300,
            target: 50300,
            protocol: "tcp",
          },
        ],
      },
    });
  }

  const beetsConfig = `
directory: /music
library: /data/beets-library.db

import:
  move: yes
  write: yes

paths:
  default: $albumartist/$album%aunique{}/$track $title
  singleton: Non-Album/$artist/$title
  comp: Compilations/$album%aunique{}/$track $title
`.trim();

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
          port: 9765,
        },
      ],
      env: [
        `DATABASE_URL=sqlite:/data/soulbeet.db`,
        `SLSKD_URL=http://$(PROJECT_NAME)_${input.appServiceName}-slskd:5030`,
        `SLSKD_API_KEY=${slskdApiKey}`,
        `SLSKD_DOWNLOAD_PATH=/downloads`,
        `BEETS_CONFIG=/config/config.yaml`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "downloads",
          mountPath: "/downloads",
        },
        {
          type: "volume",
          name: "music",
          mountPath: "/music",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "file",
          content: beetsConfig,
          mountPath: "/config/config.yaml",
        },
      ],
    },
  });

  return { services };
}
