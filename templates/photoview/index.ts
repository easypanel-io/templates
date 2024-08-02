import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appEnv = [];

  switch (input.databaseType) {
    case "sqlite": {
      appEnv.push(`PHOTOVIEW_DATABASE_DRIVER=sqlite`);
      break;
    }
    case "postgres": {
      appEnv.push(
        `PHOTOVIEW_DATABASE_DRIVER=postgres`,
        `PHOTOVIEW_POSTGRES_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`
      );
      services.push({
        type: "postgres",
        data: {
          serviceName: input.databaseServiceName,
          password: databasePassword,
        },
      });
      break;
    }
    default: {
      appEnv.push(
        `PHOTOVIEW_DATABASE_DRIVER=mysql`,
        `PHOTOVIEW_MYSQL_URL=${input.databaseType}:${databasePassword}@tcp($(PROJECT_NAME)_${input.databaseServiceName})/$(PROJECT_NAME)`
      );
      services.push({
        type: input.databaseType,
        data: {
          serviceName: input.databaseServiceName,
          password: databasePassword,
        },
      });
      break;
    }
  }

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
          port: 80,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app",
        },
      ],
    },
  });

  return { services };
}
