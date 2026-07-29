import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const surrealPassword = randomPassword();
  const surrealDbServiceName = `${input.appServiceName}-surrealdb`;
  const encryptionKey = input.encryptionKey || randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: surrealDbServiceName,
      source: {
        type: "image",
        image: input.surrealDbImage,
      },
      deploy: {
        command: `/surreal start --log info --user root --pass ${surrealPassword} rocksdb:/mydata/mydatabase.db`,
      },
      env: [
        `SURREAL_BIND=0.0.0.0:8000`,
        `SURREAL_EXPERIMENTAL_GRAPHQL=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "surreal-data",
          mountPath: "/mydata",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `OPEN_NOTEBOOK_ENCRYPTION_KEY=${encryptionKey}`,
        `SURREAL_URL=ws://$(PROJECT_NAME)_${surrealDbServiceName}:8000/rpc`,
        `SURREAL_USER=root`,
        `SURREAL_PASSWORD=${surrealPassword}`,
        `SURREAL_NAMESPACE=open_notebook`,
        `SURREAL_DATABASE=open_notebook`,
        `API_URL=https://api-$(EASYPANEL_DOMAIN)`,
      ].join("\n"),
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 8502,
        },
        {
          host: `api-$(EASYPANEL_DOMAIN)`,
          port: 5055,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "notebook-data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
