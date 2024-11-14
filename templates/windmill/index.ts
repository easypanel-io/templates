import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-database:5432/$(PROJECT_NAME)?sslmode=disable`,
        `MODE=server`,
      ].join("\n"),
      source: {
        type: "image",
        image: `${input.appServiceImage}`,
      },
      domains: [
        {
          host: input.domain,
          port: 8000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-lsp`,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-database:5432/$(PROJECT_NAME)?sslmode=disable`,
        `MODE=server`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/windmill-labs/windmill-lsp:latest",
      },
      domains: [
        {
          host: input.domain,
          port: 3001,
          https: true,
          path: "/ws",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-database:5432/$(PROJECT_NAME)?sslmode=disable`,
        `MODE=worker`,
        `WORKER_GROUP=default`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/windmill-labs/windmill:main",
      },
      deploy: {
        replicas: input.workerReplicas,
      },
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/tmp/windmill/cache",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker-native`,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-database:5432/$(PROJECT_NAME)?sslmode=disable`,
        `MODE=worker`,
        `WORKER_GROUP=native`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/windmill-labs/windmill:main",
      },
      deploy: {
        replicas: input.nativeWorkerReplicas,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-database`,
      password: databasePassword,
    },
  });

  return { services };
}
