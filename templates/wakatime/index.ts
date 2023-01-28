import {
  Output,
  Services,
  randomString,
  randomPassword,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const passwordSalt = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      env: [`WAKAPI_PASSWORD_SALT=${passwordSalt}`].join("\n"),
    },
  });

  return { services };
}
