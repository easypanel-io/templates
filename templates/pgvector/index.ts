import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "postgres",
    data: { serviceName: input.serviceName, image: input.serviceImage },
  });

  return { services };
}
