import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [`SECRET_KEY=${secretKey}`].join("\n"),
      mounts: [{ type: "volume", name: "pastes", mountPath: "/pastes" }],
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8000 }],
    },
  });

  return { services };
}
