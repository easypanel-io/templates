import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(16);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `FLATNOTES_AUTH_TYPE=password`,
        `FLATNOTES_USERNAME=${input.username}`,
        `FLATNOTES_PASSWORD=${input.password}`,
        `FLATNOTES_SECRET_KEY=${secretKey}`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
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
  return { services };
}
