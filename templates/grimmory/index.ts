import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `TZ=Etc/UTC`,
        `DATABASE_URL=jdbc:mariadb://$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)`,
        `DATABASE_USERNAME=mariadb`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `SWAGGER_ENABLED=false`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6060,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "books",
          mountPath: "/books",
        },
        {
          type: "volume",
          name: "bookdrop",
          mountPath: "/bookdrop",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
