import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [];

  if (input.domain) appEnv.push(`SEARXNG_BASE_URL=https://${input.domain}`);
  if (input.enableRedis) {
    const redisPassword = randomPassword();
    services.push({
      type: "redis",
      data: {
        projectName: input.projectName,
        serviceName: input.appServiceName + "-redis",
        password: redisPassword,
      },
    });
    appEnv.push(
      `SEARXNG_REDIS_URL=redis://default:${redisPassword}@${input.projectName}_${input.appServiceName}-redis:6379`
    );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      domains: input.domain ? [{ name: input.domain }] : [],
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 8080, secure: true },
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/etc/searxng" }],
    },
  });

  return { services };
}
