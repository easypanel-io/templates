import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = randomString(48);
  const appSecret = randomString(48);
  const adminPassword = input.adminPassword || randomPassword();
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const logLevel = input.logLevel || "info";

  const appEnv = {
    general: {
      KEY: appKey,
      SECRET: appSecret,
      PUBLIC_URL: "/",
      LOG_LEVEL: logLevel,
    },
    admin: {
      ADMIN_EMAIL: input.adminEmail,
      ADMIN_PASSWORD: adminPassword,
    },
    db: {
      DB_CLIENT: input.databaseType,
      DB_HOST: `$(PROJECT_NAME)_${input.databaseServiceName}`,
      DB_PORT: input.databaseType === "postgres" ? "5432" : "3306",
      DB_DATABASE: "$(PROJECT_NAME)",
      DB_USER: input.databaseType === "postgres" ? "postgres" : "mysql",
      DB_PASSWORD: databasePassword,
    },
    storage: {
      STORAGE_LOCATIONS: input.storageLocation,
    },
    cache: {
      CACHE_ENABLED: "true",
      CACHE_STORE: input.redisServiceName ? "redis" : "memory",
    },
    cors: {
      CORS_ENABLED: "true",
      CORS_ORIGIN: "true",
    },
  };

  if (input.storageLocation === "s3") {
    appEnv.storage = {
      ...appEnv.storage,
      ...{
        STORAGE_S3_DRIVER: `s3`,
        STORAGE_S3_KEY: input.storageS3Key,
        STORAGE_S3_SECRET: input.storageS3Secret,
        STORAGE_S3_BUCKET: input.storageS3Bucket,
        STORAGE_S3_REGION: input.storageS3Region,
        STORAGE_S3_ENDPOINT: input.storageS3Endpoint,
      },
    };
  }

  if (input.redisServiceName) {
    appEnv.cache = {
      ...appEnv.cache,
      ...{
        REDIS: `redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
      },
    };
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: Object.values(appEnv)
        .map((category) => {
          return Object.entries(category)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");
        })
        .join("\n\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8055,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/directus/uploads",
        },
        {
          type: "volume",
          name: "extensions",
          mountPath: "/directus/extensions",
        },
      ],
    },
  });

  switch (input.databaseType) {
    case "postgres":
      services.push({
        type: "postgres",
        data: {
          projectName: input.projectName,
          serviceName: input.databaseServiceName,
          password: databasePassword,
        },
      });
      break;

    case "mysql":
      services.push({
        type: "mysql",
        data: {
          projectName: input.projectName,
          serviceName: input.databaseServiceName,
          image: "mysql:5",
          password: databasePassword,
        },
      });
      break;
  }

  if (input.redisServiceName) {
    services.push({
      type: "redis",
      data: {
        projectName: input.projectName,
        serviceName: input.redisServiceName,
        password: redisPassword,
      },
    });
  }

  return { services };
}
