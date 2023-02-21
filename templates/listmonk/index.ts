import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const randomPasswordPostgres = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `LISTMONK_app__address=0.0.0.0:9000`,
        `LISTMONK_db__host=${input.projectName}_${input.databaseServiceName}`,
        `LISTMONK_db__user=postgres`,
        `LISTMONK_db__password=${randomPasswordPostgres}`,
        `LISTMONK_db__port=5432`,
        `LISTMONK_db__database=${input.projectName}`,
        `LISTMONK_app__admin_username=${input.adminUsername}`,
        `LISTMONK_app__admin_password=${input.adminPassword}`,
        
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
        command: `echo "y" | ./listmonk --install --idempotent --yes && ./listmonk`
      }
    },
  });
  
  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:14",
      password: randomPasswordPostgres,
    },
  });

  return { services };
}
