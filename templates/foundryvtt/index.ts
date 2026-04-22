import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [
    `FOUNDRY_RELEASE_URL=${input.foundryReleaseUrl}`,
    `FOUNDRY_USERNAME=${input.foundryUsername}`,
    `FOUNDRY_PASSWORD=${input.foundryPassword}`,
    `CONTAINER_CACHE=/data/container_cache`,
    ...(input.foundryAdminKey
      ? [`FOUNDRY_ADMIN_KEY=${input.foundryAdminKey}`]
      : []),
    ...(input.foundryLicenseKey
      ? [`FOUNDRY_LICENSE_KEY=${input.foundryLicenseKey}`]
      : []),
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 30000,
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
