import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appSecret = randomString(32);

  const caddyfile = `:8080 {
	handle_path /api* {
		reverse_proxy $(PROJECT_NAME)_${input.appServiceName}-api:8080
	}

	reverse_proxy $(PROJECT_NAME)_${input.appServiceName}-ui:80
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.proxyImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: caddyfile,
          mountPath: "/etc/caddy/Caddyfile",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.apiImage,
      },
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
        `APP_SECRET=${appSecret}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/dockerizalo",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ui`,
      source: {
        type: "image",
        image: input.uiImage,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
