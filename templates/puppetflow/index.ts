import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appKey = randomString(32);
  const browserStreamSecret = randomString(64);
  const pinokioToken = randomPassword();
  const redisPassword = randomPassword();

  const appHost = `$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;
  const streamHost = `$(PROJECT_NAME)-${input.appServiceName}-stream.$(EASYPANEL_HOST)`;
  const appInternalHost = `$(PROJECT_NAME)_${input.appServiceName}`;
  const streamInternalHost = `$(PROJECT_NAME)_${input.appServiceName}-stream`;
  const pinokioInternalHost = `$(PROJECT_NAME)_${input.appServiceName}-pinokio`;
  const redisInternalHost = `$(PROJECT_NAME)_${input.appServiceName}-redis`;

  const commonEnv = [
    `APP_ENV=production`,
    `APP_DEBUG=false`,
    `APP_URL=https://${appHost}`,
    `APP_KEY=${appKey}`,
    `APP_QUEUES_COUNTER=1`,
    `DB_CONNECTION=sqlite`,
    `DB_DATABASE=/app/storage/database.sqlite`,
    `REDIS_HOST=${redisInternalHost}`,
    `REDIS_PORT=6379`,
    `REDIS_PASSWORD=${redisPassword}`,
    `PINOKIO_HOST=${pinokioInternalHost}`,
    `PINOKIO_PORT=3000`,
    `PINOKIO_TOKEN=${pinokioToken}`,
    `RUNNER_API_INTERNAL_URL=http://${appInternalHost}:8000/api/internal/runner`,
    `BROWSER_STREAM_INTERNAL_URL=http://${streamInternalHost}:6080`,
    `BROWSER_STREAM_PUBLIC_URL=https://${streamHost}`,
    `BROWSER_STREAM_ALLOWED_ORIGINS=https://${appHost}`,
    `BROWSER_STREAM_SECRET=${browserStreamSecret}`,
  ].join("\n");

  const sharedMounts = [
    {
      type: "bind" as const,
      hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/storage/`,
      mountPath: "/app/storage",
    },
    {
      type: "bind" as const,
      hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/execution/`,
      mountPath: "/app/data/execution",
    },
    {
      type: "bind" as const,
      hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/uploads/`,
      mountPath: "/app/data/storage",
    },
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [commonEnv, `APP_AUTO_MIGRATE=true`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
        {
          type: "volume",
          name: "execution",
          mountPath: "/app/data/execution",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/data/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-queue`,
      env: commonEnv,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          "until [ -f /app/storage/database.sqlite ]; do sleep 2; done; php artisan queue:work --queue=1 --tries=1 --timeout=630 --sleep=3 --max-jobs=500 --max-time=3600",
      },
      mounts: sharedMounts,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-scheduler`,
      env: commonEnv,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          "until [ -f /app/storage/database.sqlite ]; do sleep 2; done; php artisan schedule:work",
      },
      mounts: sharedMounts,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-stream`,
      env: [
        `PORT=6080`,
        `REDIS_HOST=${redisInternalHost}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `BROWSER_STREAM_ALLOWED_ORIGINS=https://${appHost}`,
        `BROWSER_STREAM_SECRET=${browserStreamSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.streamServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6080,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-pinokio`,
      env: [`TOKEN=${pinokioToken}`, `CHROME_DISABLE_DEV_SHM_USAGE=true`].join(
        "\n"
      ),
      source: {
        type: "image",
        image: input.pinokioServiceImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/execution/`,
          mountPath: "/app/data/execution",
        },
        {
          type: "volume",
          name: "browsers",
          mountPath: "/opt/browsers",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
