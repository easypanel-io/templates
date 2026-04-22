import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);
  const tokenExpiration = input.genesisJwtTokenExpiration ?? 120000;
  const cookieAllowHttp =
    input.genesisJwtCookieAllowHttp ?? false ? "true" : "false";
  const createUsers =
    input.genesisCreateUsers?.trim() || `admin!:${randomPassword()}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `GENESIS_JWT_SECRET=${jwtSecret}`,
        `GENESIS_JWT_TOKEN_EXPIRATION=${tokenExpiration}`,
        `GENESIS_CREATE_USERS=${createUsers}`,
        `GENESIS_JWT_COOKIE_ALLOW_HTTP=${cookieAllowHttp}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "ocular-genesis-data",
          mountPath: "/data/genesis",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
