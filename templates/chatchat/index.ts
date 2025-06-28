import { Output, Services } from "~templates-utils";

interface Input {
  appServiceName: string;
  appServiceImage: string;
}

export function generate(input: Input): Output {
  const services: Services = [];

  // ChatChat Service
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
          port: 3000,
        },
      ],
      env: "",
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
