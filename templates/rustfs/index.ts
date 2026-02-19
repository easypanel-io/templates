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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
      ],
      env: [
        `RUSTFS_VOLUMES=/data/rustfs{0...3}`,
        `RUSTFS_ADDRESS=0.0.0.0:9000`,
        `RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001`,
        `RUSTFS_CONSOLE_ENABLE=true`,
        `RUSTFS_CORS_ALLOWED_ORIGINS=*`,
        `RUSTFS_CONSOLE_CORS_ALLOWED_ORIGINS=*`,
        `RUSTFS_ACCESS_KEY=${input.accessKey}`,
        `RUSTFS_SECRET_KEY=${input.secretKey}`,
        `RUSTFS_OBS_LOGGER_LEVEL=info`,
        `RUSTFS_OBJECT_CACHE_ENABLE=true`,
        `RUSTFS_OBJECT_CACHE_TTL_SECS=300`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data0",
          mountPath: "/data/rustfs0",
        },
        {
          type: "volume",
          name: "data1",
          mountPath: "/data/rustfs1",
        },
        {
          type: "volume",
          name: "data2",
          mountPath: "/data/rustfs2",
        },
        {
          type: "volume",
          name: "data3",
          mountPath: "/data/rustfs3",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  return { services };
}
