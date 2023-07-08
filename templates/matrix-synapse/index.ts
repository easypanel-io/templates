import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [
    `SYNAPSE_SERVER_NAME=$(PRIMARY_DOMAIN)`,
    `SYNAPSE_REPORT_STATS=${input.reportStats ? "yes" : "no"}`,
    `SYNAPSE_NO_TLS=yes`,
  ];

  if (input.databaseType === "postgres") {
    const databasePassword = randomPassword();
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        source: { type: "image", image: "postgres" },
        env: [
          `POSTGRES_USER=synapse`,
          `POSTGRES_PASSWORD=${databasePassword}`,
          `POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C`,
        ].join("\n"),
        mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: "/var/lib/postgresql/data",
          },
        ],
      },
    });
    appEnv.push(
      `POSTGRES_PASSWORD=${databasePassword}`,
      `POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`
    );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8008,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
      deploy: { command: `/start.py migrate_config && /start.py` },
    },
  });

  return { services };
}
