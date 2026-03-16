import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();

  const envVars = [
    `PUID=${input.puid ?? "1000"}`,
    `PGID=${input.pgid ?? "1000"}`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
  ];

  if (input.publicUrl) {
    envVars.push(`PUBLIC_URL=${input.publicUrl}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage ?? "ghcr.io/kikootwo/readmeabook:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3030,
        },
      ],
      env: envVars.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/app/cache",
        },
        {
          type: "volume",
          name: "downloads",
          mountPath: "/downloads",
        },
        {
          type: "volume",
          name: "media",
          mountPath: "/media",
        },
        {
          type: "volume",
          name: "pgdata",
          mountPath: "/var/lib/postgresql/data",
        },
        {
          type: "volume",
          name: "redis",
          mountPath: "/var/lib/redis",
        },
      ],
    },
  });

  return { services };
}
