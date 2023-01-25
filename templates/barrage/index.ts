import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appkey = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `NEXTAUTH_SECRET=${appkey}`,
        `NEXTAUTH_URL=${input.domain}`,
        `DELUGEURL=${input.delugeUrl}`,
        `DELUGE_PASSWORD=${input.delugePassword}`,
        `BARRAGE_PASSWORD=${input.barragePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
    },
  });

  return { services };
}
