import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const nextAuthSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `MEILI_ADDR=http://$(PROJECT_NAME)_${input.appServiceName}-meilisearch:7700`,
        `BROWSER_WEB_URL=http://$(PROJECT_NAME)_${input.appServiceName}-chrome:9222`,
        `DATA_DIR=/data`,
        `OPENAI_API_KEY=${input.openaiApiKey}`,
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-chrome`,
      source: {
        type: "image",
        image: input.chromeImage,
      },
      deploy: {
        command:
          "chromium-browser --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --hide-scrollbars",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-meilisearch`,
      env: [`MEILI_NO_ANALYTICS=true`].join("\n"),
      source: {
        type: "image",
        image: input.meilSearchImage,
      },
      mounts: [
        {
          type: "volume",
          name: "meilisearch",
          mountPath: "/meili_data",
        },
      ],
    },
  });

  return { services };
}
