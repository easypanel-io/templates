import { Output, Services } from "~templates-utils";

interface Input {
  appServiceName: string;
  appServiceImage: string;
  secretKey: string;
  enablePlugins: boolean;
}

export function generate(input: Input): Output {
  const services: Services = [];

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
          port: 8000,
        },
      ],
      env: [
        `DB_URI=sqlite:///app/data/db.sqlite`,
        `SECRET_KEY=${input.secretKey}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/app/plugins",
        },
      ],
    },
  });

  return { services };
}
