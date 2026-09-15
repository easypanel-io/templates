import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const maxBytes = Math.floor((input.maxFileSizeMb ?? 1024) * 1024 * 1024);

  const configFile = [
    `bind = 0.0.0.0:8080`,
    `filespath = /data/files/`,
    `metapath = /data/meta/`,
    `sitename = ${input.siteName || "Linx"}`,
    `maxsize = ${maxBytes}`,
    `realip = true`,
    input.allowHotlink ? `allowhotlink = true` : `# allowhotlink = false`,
    input.remoteUploads ? `remoteuploads = true` : `# remoteuploads = false`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/usr/local/bin/linx-server -config /data/linx-server.conf`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: configFile,
          mountPath: "/data/linx-server.conf",
        },
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
