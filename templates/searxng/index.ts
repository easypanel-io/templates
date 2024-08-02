import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [`SEARXNG_BASE_URL=https://$(PRIMARY_DOMAIN)`];

  if (input.enableRedis) {
    const redisPassword = randomPassword();
    services.push({
      type: "redis",
      data: {
        serviceName: input.appServiceName + "-redis",
        password: redisPassword,
      },
    });
    appEnv.push(
      `SEARXNG_REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`
    );
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/etc/searxng" }],
    },
  });

  return { services };
}
