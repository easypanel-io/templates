import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DOMAIN=https://$(PRIMARY_DOMAIN)`,
        `EMAIL=seu@email.com`,
        `TZ=America/Sao_Paulo`,
        `APP_ENV=production`,
        `NODE_ENV=production`,
        `WEBHOOK_QUEPASA=https://$(PRIMARY_DOMAIN)/webhook/quepasa`,
        `WEBHOOK_TESTE_QUEPASA=https://$(PRIMARY_DOMAIN)/webhook-test/quepasa`,
        `APP_TITLE=quepasa`,
        `QUEPASA_CONTAINER_NAME=NoCodeLeaks`,
        `QUEPASA_HOST_NAME=quepasa`,
        `QUEPASA_MEMORY_LIMIT=4096M`,
        `QUEPASA_EXTERNAL_PORT=31000`,
        `QUEPASA_INTERNAL_PORT=31000`,
        `WEBAPIPORT=31000`,
        `WEBSOCKETSSL=true`,
        `SIGNING_SECRET=BLA!2#BlA123bLA1}`,
        `QUEPASA_BASIC_AUTH_USER=seu@email.com`,
        `QUEPASA_BASIC_AUTH_PASSWORD=TESTE`,
        `METRICS_HOST=localhost}`,
        `METRICS_PORT=9392`,
        `MIGRATIONS=/builder/migrations`,
        `DEBUGJSONMESSAGES=false`,
        `HTTPLOGS=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 31000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "quepasa_lab_volume",
          mountPath: "/opt/quepasa",
        },
        {
          type: "volume",
          name: "quepasa_lab_builder_volume",
          mountPath: "/builder",
        },
      ],
    },
  });

  return { services };
}
