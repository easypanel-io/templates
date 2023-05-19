import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `MCAPTCHA_REDIS_URL=redis://default@${input.projectName}_${input.redisServiceName}:6379`,
        `MCAPTCHA_SERVER_DOMAIN=${input.domain}`,
        `MCAPTCHA_ALLOW_REGISTRATION=false`,
        `MCAPTCHA_ALLOW_DEMO=false`,
        `MCAPTCHA_COMMERCIAL=false`,
        `MCAPTCHA_CAPTCHA_GC=30`,
        `MCAPTCHA_SERVER_PROXY_HAS_TLS=true`,
        `MCAPTCHA_CAPTCHA_SALT=${secret}`,
        `RUST_LOG=debug`,
        `PORT=80`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      source: {
        type: "image",
        image: "mcaptcha/cache",
      },
      proxy: {
        port: 6379,
        secure: true,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
