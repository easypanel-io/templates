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
        `LISTMONK_app__address=0.0.0.0:9000`,
        `LISTMONK_db__host=${input.appServiceName}_${input.databaseServiceName}`,
        `LISTMONK_db__user=${input.databaseUser}`,
        `LISTMONK_db__password=${input.databasePassword}`,
        `LISTMONK_db__port=5432`,
        `LISTMONK_db__database=listmonk`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 9000,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/listmonk/uploads",
        },
      ],
      deploy: {
        command: `echo "y" | ./listmonk --install && ./listmonk`
      }
    },
  });
  
  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:14",
      password: input.databasePassword,
    },
  });

  return { services };
}
