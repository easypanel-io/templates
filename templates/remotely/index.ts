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
          port: 5000,
        },
      ],
      env: [
        "ASPNETCORE_ENVIRONMENT=Production",
        "ASPNETCORE_HTTP_PORTS=5000",
        "Serilog__MinimumLevel__Override__Microsoft.AspNetCore=Warning",
        "Serilog__MinimumLevel__Override__System=Warning",
        "Remotely_ApplicationOptions__DbProvider=SQLite",

        "Remotely_ConnectionStrings__SQLite=Data Source=/app/AppData/Remotely.db",
        "Remotely_ConnectionStrings__SQLServer=Server=(localdb)\\mssqllocaldb;Database=Remotely-Server-53bc9b9d-9d6a-45d4-8429-2a2761773502;Trusted_Connection=True;MultipleActiveResultSets=true",
        "Remotely_ConnectionStrings__PostgreSQL=Host=localhost;Database=Remotely;Username=postgres;Password=changeme;",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "remotely-data",
          mountPath: "/app/AppData",
        },
      ],
    },
  });

  return { services };
}
