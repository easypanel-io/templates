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
      env: [`POSTGRES_PASSWORD=${input.dbPassword}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "timescaledb_data",
          mountPath: "/home/postgres/pgdata/data",
        },
      ],
      domains: [
        {
          host: "$(EASY_DOMAIN)",
          port: 5432,
        },
      ],
    },
  });

  return { services };
}
