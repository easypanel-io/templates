import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const siteName = input.projectName || input.metabaseSiteName;

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `MB_SITE_NAME=${siteName}`,
        `MB_APPLICATION_NAME=${siteName}`,
        `MB_DB_FILE=/metabase-data/metabase.db`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/metabase-data",
        },
      ],
    },
  });

  return { services };
}
