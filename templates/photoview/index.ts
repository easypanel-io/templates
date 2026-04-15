import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appEnv = [];

  switch (input.databaseType) {
    case "sqlite": {
      appEnv.push(`PHOTOVIEW_DATABASE_DRIVER=sqlite`);
      appEnv.push(
        `PHOTOVIEW_SQLITE_PATH=/home/photoview/database/photoview.db`
      );
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
        `PHOTOVIEW_MYSQL_URL=${input.databaseServiceName}:${databasePassword}@tcp($(PROJECT_NAME)_${input.databaseServiceName})/$(PROJECT_NAME)`
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

  appEnv.push(`PHOTOVIEW_LISTEN_IP=0.0.0.0`);

  if (input.mapboxToken) {
    appEnv.push(`MAPBOX_TOKEN=${input.mapboxToken}`);
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
          name: "media-cache",
          mountPath: "/home/photoview/media-cache",
        },
        {
          type: "volume",
          name: "database",
          mountPath: "/home/photoview/database",
        },
        {
          type: "volume",
          name: "photos",
          mountPath: "/photos",
        },
      ],
    },
  });

  return { services };
}
