import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [
        `PORT=8080`,
        `ADMIN_USERNAME=${input.appAdminUsername}`,
        `ADMIN_PASSWORD=${input.appAdminPassword}`,
        `SECRET_KEY=${secretKey}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "instance",
          mountPath: "/app/instance",
        },
      ],
    },
  });

  return { services };
}
