import { Output, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  return {
    services: [
      {
        type: "compose",
        data: {
          serviceName: input.serviceName,
          source: {
            type: "git",
            repo: "https://github.com/Noveum/orbit.git",
            ref: "codex/catalog-release-2026-09-24",
            rootPath: "/deploy/catalogs",
            composeFile: "compose.yaml",
          },
          createDotEnv: true,
          env: [
            "ORBIT_IMAGE=ghcr.io/noveum/orbit-runtime:sha-7da6cdb83550c4e597800b2788c4ce534d1af669",
            "ORBIT_GATEWAY_IMAGE=ghcr.io/noveum/orbit-gateway:sha-7da6cdb83550c4e597800b2788c4ce534d1af669",
            "ORBIT_BUCKET_IMAGE=ghcr.io/noveum/orbit-bucket:sha-e219d286638b9479e7946979b4383ea4e99c5bd6",
            `ORBIT_APP_URL=https://${input.appDomain}`,
            `ORBIT_STORAGE_URL=https://${input.storageDomain}`,
            `POSTGRES_PASSWORD=${randomString(48)}`,
            `MINIO_PASSWORD=${randomString(48)}`,
            `BETTER_AUTH_SECRET=${randomString(64)}`,
            `CRON_SECRET=${randomString(64)}`,
          ].join("\n"),
          domains: [
            {
              host: input.appDomain,
              port: 3000,
              service: "orbit",
              https: true,
            },
            {
              host: input.storageDomain,
              port: 9000,
              service: "storage",
              https: true,
            },
          ],
        },
      },
    ],
  };
}
