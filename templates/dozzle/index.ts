import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `DOZZLE_HOSTNAME=$(PRIMARY_DOMAIN)`,
    `DOZZLE_LEVEL=${input.dozzleLevel}`,
    `DOZZLE_NO_ANALYTICS=${input.dozzleNoAnalytics}`,
  ];
  if (input.dozzlePassword) {
    appEnv.push(
      `DOZZLE_USERNAME=${input.dozzleUsername || "admin"}`,
      `DOZZLE_PASSWORD=${input.dozzlePassword}`
    );
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  return { services };
}
