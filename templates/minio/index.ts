import {
  Output,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `MINIO_ROOT_USER=${input.rootUser}`,
    `MINIO_ROOT_PASSWORD=${input.rootPassword}`,

    // Required for the client, without this the client will redirect to default port
    // https://github.com/minio/console/issues/2539#issuecomment-1619211962
    `MINIO_BROWSER_LOGIN_ANIMATION=off`,
    `MINIO_SKIP_CLIENT=yes`,
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: "minio-server",
      source: { type: "image", image: "bitnami/minio:2023.11.20" },
      env: appEnv.join("\n"),
      deploy: {
        replicas: 1,
        zeroDowntime: true,
      },
      domains: [
        {
          host: input.clientDomain,
          https: true,
          port: 9001,
          path: "/",
        },
        {
          host: input.serverDomain,
          https: true,
          port: 9000,
          path: "/",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "minio-data",
          mountPath: "/bitnami/minio/data",
        },
      ],
    },
  });

  return { services };
}
