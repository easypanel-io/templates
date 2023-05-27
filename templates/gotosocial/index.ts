import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `GTS_HOST=${input.domain}`,
        `GTS_DB_TYPE=sqlite`,
        `GTS_DB_ADDRESS=/gotosocial/storage/sqlite.db`,
        `GTS_LETSENCRYPT_ENABLED=false`,
        `GTS_ACCOUNTS_REGISTRATION_OPEN=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/gotosocial/storage",
        },
      ],
    },
  });

  return { services };
}
