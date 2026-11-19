import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const browserServiceName = `${input.appServiceName}-browser`;
  const appKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_NAME=${input.appName}`,
        `APP_DESCRIPTION=${input.appDescription}`,
        `APP_KEY=${appKey}`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_LOCALE=${input.appLocale}`,
        `APP_DEBUG=false`,
        `BROWSER_WS_ENDPOINT=ws://$(PROJECT_NAME)_${browserServiceName}:9222`,
        `DISABLE_CACHE=${input.disableCache}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/www/html/storage/app",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: browserServiceName,
      source: {
        type: "image",
        image: input.browserServiceImage,
      },
    },
  });

  return { services };
}
