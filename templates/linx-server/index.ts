import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const maxBytes = Math.floor((input.maxFileSizeMb ?? 1024) * 1024 * 1024);

  const flags = [
    `-bind=0.0.0.0:8080`,
    `-filespath=/data/files/`,
    `-metapath=/data/meta/`,
    `-sitename=${input.siteName || "Linx"}`,
    `-maxsize=${maxBytes}`,
    `-realip`,
  ];

  if (input.allowHotlink) flags.push(`-allowhotlink`);
  if (input.remoteUploads) flags.push(`-remoteuploads`);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/usr/local/bin/linx-server ${flags.join(" ")}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "files",
          mountPath: "/data/files",
        },
        {
          type: "volume",
          name: "meta",
          mountPath: "/data/meta",
        },
      ],
    },
  });

  return { services };
}
