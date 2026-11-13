import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const name = input.appServiceName;
  const image = input.appServiceImage;

  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const usagePassword = randomPassword();
  const opensslKey = randomString(64);
  const executorSecret = randomString(64);
  const geoSecret = randomString(64);
  const jobsSecret = randomString(64);
  const trackingSecret = randomString(64);

  const domain = `$(PROJECT_NAME)-${name}.$(EASYPANEL_HOST)`;
  const network = "easypanel-$(PROJECT_NAME)";
  const runtimesNetwork = `$(PROJECT_NAME)_${name}-runtimes`;
  const storageHostPath = `/etc/easypanel/projects/$(PROJECT_NAME)/${name}-storage`;
  const buildsVolume = `$(PROJECT_NAME)_${name}-builds`;
  const dockerSocket = {
    type: "bind" as const,
    hostPath: "/var/run/docker.sock",
    mountPath: "/var/run/docker.sock",
  };
  const storageMount = (folder: string) => ({
    type: "bind" as const,
    hostPath: `${storageHostPath}/${folder}`,
    mountPath: `/storage/${folder}`,
  });
  const storageFolders = [
    "uploads",
    "imports",
    "cache",
    "config",
    "certificates",
    "functions",
    "sites",
    "builds",
  ];
  const clickhouseUrl = `http://appwrite:${usagePassword}@${name}-clickhouse:8123/appwrite`;
  const functionsRuntimes = "node-22";
  const sitesRuntimes = "static-1,node-22";

  const env = [
    "_APP_ENV=production",
    "_APP_LOCALE=en",
    "_APP_OPTIONS_ABUSE=enabled",
    "_APP_OPTIONS_FORCE_HTTPS=disabled",
    "_APP_OPTIONS_ROUTER_PROTECTION=disabled",
    "_APP_ROUTER_AUTO_CERTIFICATES=disabled",
    "_APP_CONSOLE_WHITELIST_ROOT=enabled",
    `_APP_OPENSSL_KEY_V1=${opensslKey}`,
    `_APP_NOTIFICATIONS_TRACKING_SECRET=${trackingSecret}`,
    `_APP_DOMAIN=${domain}`,
    `_APP_DOMAIN_TARGET=${domain}`,
    `_APP_DOMAIN_TARGET_CNAME=${domain}`,
    `_APP_DOMAIN_FUNCTIONS=functions.${domain}`,
    `_APP_DOMAIN_SITES=sites.${domain}`,
    "_APP_DB_ADAPTER=postgresql",
    `_APP_DB_HOST=${name}-db`,
    "_APP_DB_PORT=5432",
    "_APP_DB_SCHEMA=appwrite",
    "_APP_DB_USER=appwrite",
    `_APP_DB_PASS=${databasePassword}`,
    `_APP_REDIS_HOST=${name}-redis`,
    "_APP_REDIS_PORT=6379",
    `_APP_REDIS_PASS=${redisPassword}`,
    "_APP_USAGE_STATS=enabled",
    `_APP_USAGE_PASS=${usagePassword}`,
    `_APP_CONNECTIONS_DB_USAGE=${clickhouseUrl}`,
    `_APP_CONNECTIONS_DB_EXECUTIONS=${clickhouseUrl}`,
    `_APP_GEO_ENDPOINT=http://${name}-geo/v1`,
    `_APP_GEO_SECRET=${geoSecret}`,
    `_APP_EXIFTOOL_HOST=http://${name}-exiftool:8080`,
    `_APP_BROWSER_HOST=http://${name}-browser:3000/v1`,
    `_APP_WORKER_SCREENSHOTS_ROUTER=http://${name}-api`,
    `_APP_EXECUTOR_HOST=http://${name}-executor/v1`,
    `_APP_EXECUTOR_SECRET=${executorSecret}`,
    `_APP_JOBS_HOST=http://${name}-orchestrator:8080`,
    `_APP_JOBS_SECRET=${jobsSecret}`,
    `_APP_JOBS_ENDPOINT=http://${name}-api`,
    `_APP_BUILDS_VOLUME=${buildsVolume}`,
    `_APP_MIGRATION_HOST=${name}-api`,
    `_APP_COMPUTE_RUNTIMES_NETWORK=${runtimesNetwork}`,
    `_APP_FUNCTIONS_RUNTIMES=${functionsRuntimes}`,
    `_APP_SITES_RUNTIMES=${sitesRuntimes}`,
    "_APP_STORAGE_LIMIT=30000000",
    "_APP_STORAGE_PREVIEW_LIMIT=20000000",
    "_APP_EMBEDDING=disabled",
    "_APP_SMTP_HOST=",
    "_APP_SMTP_PORT=",
  ].join("\n");

  const storageScript = `set -e
for folder in ${storageFolders.join(" ")}; do
  mkdir -p "/project/${name}-storage/$folder"
done
if ! docker volume inspect "$BUILDS_VOLUME" > /dev/null 2>&1; then
  docker volume create --driver local --opt type=none --opt o=bind --opt device="$BUILDS_PATH" "$BUILDS_VOLUME"
fi
exec sleep 2147483647
`;

  const caddyfile = `{
	admin off
	servers {
		trusted_proxies static private_ranges
	}
}

:80 {
	@console {
		host {$APPWRITE_DOMAIN}
		not path /v1* /.well-known*
		not header_regexp x-appwrite-hostname .+
	}
	handle /v1/realtime* {
		reverse_proxy ${name}-realtime:80
	}
	handle @console {
		reverse_proxy ${name}-console:3000
	}
	handle {
		reverse_proxy ${name}-api:80
	}
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-storage`,
      source: {
        type: "image",
        image: "docker:28.5.2-cli",
      },
      env: [
        `BUILDS_VOLUME=${buildsVolume}`,
        `BUILDS_PATH=${storageHostPath}/builds`,
      ].join("\n"),
      deploy: {
        command: "sh /scripts/storage.sh",
      },
      mounts: [
        dockerSocket,
        {
          type: "bind",
          hostPath: "/etc/easypanel/projects/$(PROJECT_NAME)",
          mountPath: "/project",
        },
        {
          type: "file",
          content: storageScript,
          mountPath: "/scripts/storage.sh",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: name,
      source: {
        type: "image",
        image: "caddy:2.11.9-alpine",
      },
      env: `APPWRITE_DOMAIN=${domain}`,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
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
    type: "app",
    data: {
      serviceName: `${name}-api`,
      source: {
        type: "image",
        image,
      },
      env,
      mounts: storageFolders.map(storageMount),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-console`,
      source: {
        type: "image",
        image: "appwrite/new:1.2.181-self-hosted",
      },
      env: [
        "VITE_CONSOLE_PROFILE=self-hosted",
        "APPWRITE_ENDPOINT_SAME_ORIGIN=true",
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-realtime`,
      source: {
        type: "image",
        image,
      },
      env,
      deploy: {
        command: "realtime",
      },
    },
  });

  const processes = [
    { suffix: "worker", command: "worker", storage: true },
    { suffix: "task-scheduler", command: "schedule", storage: false },
    { suffix: "task-maintenance", command: "maintenance", storage: false },
    { suffix: "task-interval", command: "interval", storage: false },
  ];

  for (const process of processes) {
    services.push({
      type: "app",
      data: {
        serviceName: `${name}-${process.suffix}`,
        source: {
          type: "image",
          image,
        },
        env,
        deploy: {
          command: process.command,
        },
        mounts: process.storage ? storageFolders.map(storageMount) : [],
      },
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-executor`,
      source: {
        type: "image",
        image: "openruntimes/executor:1.3.1",
      },
      env: [
        "OPR_EXECUTOR_IMAGES=openruntimes/node:v5-22,openruntimes/static:v5-1",
        "OPR_EXECUTOR_INACTIVE_THRESHOLD=60",
        "OPR_EXECUTOR_MAINTENANCE_INTERVAL=3600",
        `OPR_EXECUTOR_NETWORK=${runtimesNetwork}`,
        "OPR_EXECUTOR_ENV=production",
        `OPR_EXECUTOR_RUNTIMES=${functionsRuntimes},${sitesRuntimes}`,
        `OPR_EXECUTOR_SECRET=${executorSecret}`,
        "OPR_EXECUTOR_RUNTIME_VERSIONS=v5",
        "OPEN_RUNTIMES_NFT=enabled",
        "OPR_EXECUTOR_CONNECTION_STORAGE=local://localhost",
      ].join("\n"),
      deploy: {
        command:
          'hostname "$(docker inspect -f "{{index .Config.Labels \\"com.docker.swarm.task.id\\"}}" "$(hostname)" | cut -c1-12)" && exec docker-php-entrypoint php app/http.php',
        capAdd: ["SYS_ADMIN"],
      },
      mounts: [
        dockerSocket,
        storageMount("builds"),
        storageMount("functions"),
        storageMount("sites"),
        {
          type: "bind",
          hostPath: "/tmp",
          mountPath: "/tmp",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-orchestrator`,
      source: {
        type: "image",
        image: "ghcr.io/open-runtimes/orchestrator/orchestrator:4.0.0",
      },
      env: [
        "ORCHESTRATOR_BACKEND=docker",
        `ORCHESTRATOR_NETWORK=${network}`,
        `DOCKER_NETWORK=${network}`,
        `ARTIFACT_ENDPOINT=http://${name}-orchestrator:8080`,
      ].join("\n"),
      deploy: {
        groups: ["988", "998", "999"],
      },
      mounts: [dockerSocket],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-geo`,
      source: {
        type: "image",
        image: "appwrite/geo:0.3.2",
      },
      env: `GEO_SECRET=${geoSecret}`,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-browser`,
      source: {
        type: "image",
        image: "appwrite/browser:0.3.10",
      },
      env: `ALLOWED_HOSTS=${name}-api`,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-exiftool`,
      source: {
        type: "image",
        image: "ghcr.io/appwrite/exiftool:0.1.1",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-clickhouse`,
      source: {
        type: "image",
        image: "clickhouse/clickhouse-server:26.4.3-alpine",
      },
      env: [
        "CLICKHOUSE_DB=appwrite",
        "CLICKHOUSE_USER=appwrite",
        `CLICKHOUSE_PASSWORD=${usagePassword}`,
        "CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "file",
          content: `<?xml version="1.0"?>
<clickhouse>
    <asynchronous_metric_log remove="1"/>
    <metric_log remove="1"/>
    <histogram_metric_log remove="1"/>
    <query_metric_log remove="1"/>
    <processors_profile_log remove="1"/>
    <trace_log remove="1"/>
    <text_log remove="1"/>
    <asynchronous_insert_log><ttl>event_date + INTERVAL 3 DAY DELETE</ttl></asynchronous_insert_log>
    <query_log><ttl>event_date + INTERVAL 7 DAY DELETE</ttl></query_log>
    <query_views_log><ttl>event_date + INTERVAL 7 DAY DELETE</ttl></query_views_log>
    <query_thread_log><ttl>event_date + INTERVAL 7 DAY DELETE</ttl></query_thread_log>
    <part_log><ttl>event_date + INTERVAL 7 DAY DELETE</ttl></part_log>
    <background_schedule_pool_log><ttl>event_date + INTERVAL 7 DAY DELETE</ttl></background_schedule_pool_log>
    <error_log><ttl>event_date + INTERVAL 14 DAY DELETE</ttl></error_log>
</clickhouse>
`,
          mountPath: "/etc/clickhouse-server/config.d/appwrite.xml",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-db`,
      source: {
        type: "image",
        image: "appwrite/postgres:0.1.0",
      },
      env: [
        "POSTGRES_DB=appwrite",
        "POSTGRES_USER=appwrite",
        `POSTGRES_PASSWORD=${databasePassword}`,
      ].join("\n"),
      deploy: {
        command:
          "docker-entrypoint.sh postgres -c max_connections=500 -c tcp_keepalives_idle=60 -c tcp_keepalives_interval=30 -c tcp_keepalives_count=5",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/postgresql",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${name}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
