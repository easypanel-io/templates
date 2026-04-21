import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      source: {
        type: "image",
        image: input.backendImage,
      },
      mounts: [
        {
          type: "volume",
          name: "kitchenowl-data",
          mountPath: "/data",
        },
      ],
      env: [`JWT_SECRET_KEY=${jwtSecretKey}`].join("\n"),
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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `BACK_URL=$(PROJECT_NAME)_${input.appServiceName}-backend:5000`,
      ].join("\n"),
    },
  });

  return { services };
}
