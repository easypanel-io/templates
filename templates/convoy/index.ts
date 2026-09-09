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
  const redisPassword = randomPassword();
  const jwtSecret = randomString(32);
  const jwtRefreshSecret = randomString(32);

  const dbServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;
  const webServiceName = `${input.appServiceName}-web`;
  const agentServiceName = `${input.appServiceName}-agent`;

  // Convoy's own boot check for its "host" field is cosmetic (used for link
  // generation), but $(PRIMARY_DOMAIN)/$(EASYPANEL_DOMAIN) only reliably
  // resolve on the service that itself owns a `domains` block (confirmed
  // against real deploys on a previous template) — web/agent own none, so a
  // plain input with a safe placeholder fallback is used instead of relying
  // on that substitution here.
  const hostName =
    input.publicDomain || `$(PROJECT_NAME)-${input.appServiceName}.local`;

  const convoyConfig = {
    auth: {
      native: { enabled: true },
      jwt: {
        enabled: true,
        secret: jwtSecret,
        expiry: 3600,
        refresh_secret: jwtRefreshSecret,
        refresh_expiry: 86400,
      },
      is_signup_enabled: false,
    },
    database: {
      type: "postgres",
      scheme: "postgres",
      host: `$(PROJECT_NAME)_${dbServiceName}`,
      username: "postgres",
      password: databasePassword,
      database: "convoy",
      options: "sslmode=disable",
      port: 5432,
    },
    redis: {
      scheme: "redis",
      host: `$(PROJECT_NAME)_${redisServiceName}`,
      username: "default",
      password: redisPassword,
      port: 6379,
    },
    server: {
      http: {
        ssl: false,
        port: 5005,
        socket_port: 5008,
      },
    },
    env: "production",
    host: hostName,
    root_path: "",
    storage_policy: {
      type: "on_prem",
      on_prem: { path: "/convoy/storage" },
    },
  };

  const convoyConfigMount = {
    type: "file" as const,
    content: JSON.stringify(convoyConfig, null, 2),
    mountPath: "/convoy.json",
  };

  services.push({
    type: "app",
    data: {
      serviceName: webServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/cmd migrate up --config /convoy.json && /cmd bootstrap --email ${input.adminEmail} --config /convoy.json && /cmd server --config /convoy.json`,
      },
      mounts: [
        convoyConfigMount,
        {
          type: "volume",
          name: "storage",
          mountPath: "/convoy/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: agentServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        // Delayed so the web service's migration has time to complete
        // before the agent connects, avoiding a schema race.
        command: "sleep 20 && /cmd agent --config /convoy.json",
      },
      mounts: [convoyConfigMount],
    },
  });

  const caddyfile = `:80 {
	handle /ingest/* {
		reverse_proxy $(PROJECT_NAME)_${agentServiceName}:5008
	}

	handle /portal-api/events/* {
		reverse_proxy $(PROJECT_NAME)_${agentServiceName}:5008
	}
	handle /portal-api/events {
		reverse_proxy $(PROJECT_NAME)_${agentServiceName}:5008
	}

	handle /portal-api/eventdeliveries/* {
		reverse_proxy $(PROJECT_NAME)_${agentServiceName}:5008
	}
	handle /portal-api/eventdeliveries {
		reverse_proxy $(PROJECT_NAME)_${agentServiceName}:5008
	}

	handle {
		reverse_proxy $(PROJECT_NAME)_${webServiceName}:5005
	}
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "caddy:2.8.4-alpine",
      },
      domains: [
        {
          host: input.publicDomain || "$(EASYPANEL_DOMAIN)",
          port: 80,
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
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "convoy",
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
