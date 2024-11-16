import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 11434 }],

      env: [`OLLAMA_KEEP_ALIVE=24h`, `OLLAMA_HOST=0.0.0.0`].join("\n"),
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
      serviceName: `${input.appServiceName}-web`,
      source: { type: "image", image: input.uiServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],

      env: [
        `OLLAMA_BASE_URLS=http://$(PROJECT_NAME)_${input.appServiceName}:11434`,
        `ENV=dev`,
        `WEBUI_AUTH=False`,
        `WEBUI_NAME=${input.webuiName}`,
        `WEBUI_URL=http://$(PRIMARY_DOMAIN)`,
        `WEBUI_SECRET_KEY=t0p-s3cr3t`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "webui-data",
          mountPath: "/app/backend/data",
        },
      ],
    },
  });

  return { services };
}
