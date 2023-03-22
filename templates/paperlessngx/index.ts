import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretkey = randomString(32);
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `PAPERLESS_SECRET_KEY=${secretkey}`,
        `PAPERLESS_REDIS=redis://default:${redisPassword}@${input.projectName}_${input.redisServiceName}:6379`,
        `PAPERLESS_ADMIN_USER=admin`,
        `PAPERLESS_ADMIN_PASSWORD=password`,
        `PAPERLESS_URL=https://${input.domain}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8000,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "consume",
          mountPath: "/usr/src/paperless/consume",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/src/paperless/data",
        },
        {
          type: "volume",
          name: "export",
          mountPath: "/usr/src/paperless/export",
        },
        {
          type: "volume",
          name: "media",
          mountPath: "/usr/src/paperless/media",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
