import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `OPENPROJECT_SECRET_KEY_BASE=${randomString(64)}`,
    `OPENPROJECT_HTTPS=true`,
  ];
  if (input.domain) {
    appEnv.push(`OPENPROJECT_HOST__NAME=${input.domain}`);
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 3000, secure: true },
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/var/openproject/assets",
        },
        {
          type: "volume",
          name: "pgdata",
          mountPath: "/var/openproject/pgdata",
        },
      ],
    },
  });

  return { services };
}
