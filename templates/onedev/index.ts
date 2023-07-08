import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const passwordPostgres = randomPassword();

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:15",
      password: passwordPostgres,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6610,
        },
      ],
      env: [
        `HIBERNATE_DIALECT=io.onedev.server.persistence.PostgreSQLDialect`,
        `HIBERNATE_CONNECTION_DRIVER_CLASS=org.postgresql.Driver`,
        `HIBERNATE_CONNECTION_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `HIBERNATE_CONNECTION_USERNAME=${input.databaseServiceName}`,
        `HIBERNATE_CONNECTION_PASSWORD=${passwordPostgres}`,
        `INITIAL_SERVER_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/onedev",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
      ports: [
        {
          published: 6611,
          target: 6611,
        },
      ],
    },
  });

  return { services };
}
