import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    `DUFS_SERVE_PATH=/data`,
    `DUFS_BIND=0.0.0.0`,
    `DUFS_PORT=5000`,
    `DUFS_ALLOW_UPLOAD=${input.allowUpload ? "true" : "false"}`,
    `DUFS_ALLOW_DELETE=${input.allowDelete ? "true" : "false"}`,
    `DUFS_ALLOW_SEARCH=${input.allowSearch ? "true" : "false"}`,
    `DUFS_ALLOW_ARCHIVE=${input.allowArchive ? "true" : "false"}`,
  ];
  const username = input.authUsername?.trim() || "admin";
  const password = input.authPassword?.trim() || randomPassword();
  const publicRead = input.requireLoginToView ? "" : "|@/";
  env.push(`DUFS_AUTH=${username}:${password}@/:rw${publicRead}`);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
