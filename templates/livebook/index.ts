import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const livebookSecretKeyBase = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `LIVEBOOK_PASSWORD=${input.livebookPassword}`,
        `LIVEBOOK_SECRET_KEY_BASE=${livebookSecretKeyBase}`,
        `LIVEBOOK_DEFAULT_RUNTIME=standalone`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "livebook-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
