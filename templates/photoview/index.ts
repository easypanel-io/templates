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
        `PHOTOVIEW_POSTGRES_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`
      );
      services.push({
        type: "postgres",
        data: {
          projectName: input.projectName,
          serviceName: input.databaseServiceName,
          password: databasePassword,
        },
      });
      break;
    }
    default: {
      appEnv.push(
        `PHOTOVIEW_DATABASE_DRIVER=mysql`,
        `PHOTOVIEW_MYSQL_URL=${input.databaseType}:${databasePassword}@tcp(${input.projectName}_${input.databaseServiceName})/${input.projectName}`
      );
      services.push({
        type: input.databaseType,
        data: {
          projectName: input.projectName,
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
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 80, secure: true },
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
