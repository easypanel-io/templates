import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

const image = (name: string) =>
  `ghcr.io/openlabs-so/openanalytics/${name}:v0.4.2`;

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const clickhouseIngestPassword = randomPassword();
  const clickhouseReadPassword = randomPassword();
  const clickhouseMaintenancePassword = randomPassword();
  const clickhouseMigrationPassword = randomPassword();
  const valkeyQueuePassword = randomPassword();
  const valkeyRealtimePassword = randomPassword();
  const authSecret = randomString(64);
  const anonymousIdentitySecret = randomString(64);
  const trialIdentitySecret = randomString(64);
  const credentialSourceSecret = randomString(64);

  const appDomain = `app.${input.baseDomain}`;
  const apiDomain = `api.${input.baseDomain}`;
  const collectorDomain = `c.${input.baseDomain}`;
  const realtimeDomain = `rt.${input.baseDomain}`;
  const host = (suffix: string) =>
    `$(PROJECT_NAME)_${input.serviceName}-${suffix}`;
  const appVolumePath = (serviceSuffix: string, volumeName: string) =>
    `/etc/easypanel/projects/$(PROJECT_NAME)/${input.serviceName}-${serviceSuffix}/volumes/${volumeName}`;

  const postgresHost = host("postgres");
  const clickhouseHost = host("clickhouse");
  const valkeyQueueHost = host("valkey-queue");
  const valkeyRealtimeHost = host("valkey-realtime");
  const gatewayHost = host("gateway");
  const webHost = host("web");
  const apiHost = host("api");
  const collectorHost = host("collector");
  const realtimeHost = host("realtime");

  const nodeRuntimeEnv = [
    `NODE_ENV=production`,
    `ENVIRONMENT=production`,
    `LOG_LEVEL=info`,
  ];

  const keygenCommand = `sh -ec '
mkdir -p /keys/api /keys/gateway /keys/realtime /keys/collector /keyring
for entry in "query gateway" "realtime realtime" "preview collector"; do
  set -- $entry
  pair=$1
  dest=$2
  if [ ! -f "/keys/api/$pair.private.pem" ]; then
    openssl genpkey -algorithm ed25519 -out "/keys/api/$pair.private.pem"
  fi
  if [ ! -f "/keys/$dest/$pair.public.pem" ]; then
    openssl pkey -in "/keys/api/$pair.private.pem" -pubout -out "/keys/$dest/$pair.public.pem"
  fi
done
if [ ! -f /keyring/credential-keyring.json ]; then
  printf "{\\"active\\":\\"k1\\",\\"keys\\":{\\"k1\\":\\"%s\\"}}" "$(openssl rand -base64 32)" > /keyring/credential-keyring.json
fi
chown -R 1000:1000 /keys /keyring
chmod 700 /keys/api /keys/gateway /keys/realtime /keys/collector /keyring
chmod 400 /keys/api/*.pem /keyring/credential-keyring.json
chmod 444 /keys/gateway/*.pem /keys/realtime/*.pem /keys/collector/*.pem
'`;

  const geoipCommand = `sh -ec '
if [ -f /geoip/dbip-city-lite.mmdb ]; then exit 0; fi
apk add --no-cache curl >/dev/null
y=$(date -u +%Y)
m=$(date -u +%m | sed "s/^0*//")
pm=$((m - 1))
py=$y
if [ "$pm" -le 0 ]; then pm=12; py=$((y - 1)); fi
prev=$(printf "%04d-%02d" "$py" "$pm")
fetched=""
for month in "$(date -u +%Y-%m)" "$prev"; do
  if curl -fsSL --retry 2 --max-time 300 -o /tmp/dbip.gz "https://download.db-ip.com/free/dbip-city-lite-$month.mmdb.gz"; then
    fetched="$month"
    break
  fi
done
if [ -z "$fetched" ]; then exit 1; fi
gzip -dc /tmp/dbip.gz > /tmp/dbip.mmdb
if ! tail -c 200000 /tmp/dbip.mmdb | strings | grep -q "MaxMind.com"; then exit 1; fi
mv /tmp/dbip.mmdb /geoip/dbip-city-lite.mmdb
chown 1000:1000 /geoip/dbip-city-lite.mmdb
chmod 444 /geoip/dbip-city-lite.mmdb
'`;

  const caddyfile = `{
  auto_https off
}

:80 {
  @web host ${appDomain}
  handle @web {
    reverse_proxy {$WEB_UPSTREAM} {
      header_up -Fly-Client-IP
      header_up -CF-Connecting-IP
      header_up -True-Client-IP
      header_up -X-Vercel-IP-Country
      header_up -X-Vercel-IP-City
      header_up -Fly-Client-Country
      header_up -CF-IPCountry
      header_up -CF-IPCity
    }
  }

  @api host ${apiDomain}
  handle @api {
    reverse_proxy {$API_UPSTREAM} {
      header_up -Fly-Client-IP
      header_up -CF-Connecting-IP
      header_up -True-Client-IP
      header_up -X-Vercel-IP-Country
      header_up -X-Vercel-IP-City
      header_up -Fly-Client-Country
      header_up -CF-IPCountry
      header_up -CF-IPCity
    }
  }

  @collector host ${collectorDomain}
  handle @collector {
    reverse_proxy {$COLLECTOR_UPSTREAM} {
      header_up -Fly-Client-IP
      header_up -CF-Connecting-IP
      header_up -True-Client-IP
      header_up -X-Vercel-IP-Country
      header_up -X-Vercel-IP-City
      header_up -Fly-Client-Country
      header_up -CF-IPCountry
      header_up -CF-IPCity
    }
  }

  @realtime host ${realtimeDomain}
  handle @realtime {
    reverse_proxy {$REALTIME_UPSTREAM} {
      header_up -Fly-Client-IP
      header_up -CF-Connecting-IP
      header_up -True-Client-IP
      header_up -X-Vercel-IP-Country
      header_up -X-Vercel-IP-City
      header_up -Fly-Client-Country
      header_up -CF-IPCountry
      header_up -CF-IPCity
    }
  }

  respond 404
}`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.serviceName}-postgres`,
      image: "postgres:17-alpine",
      user: "openanalytics",
      databaseName: "openanalytics",
      password: postgresPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-clickhouse`,
      source: { type: "image", image: image("clickhouse") },
      env: [
        `CLICKHOUSE_INGEST_PASSWORD=${clickhouseIngestPassword}`,
        `CLICKHOUSE_READ_PASSWORD=${clickhouseReadPassword}`,
        `CLICKHOUSE_MAINTENANCE_PASSWORD=${clickhouseMaintenancePassword}`,
        `CLICKHOUSE_MIGRATION_PASSWORD=${clickhouseMigrationPassword}`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "ch-data", mountPath: "/var/lib/clickhouse" },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-valkey-queue`,
      source: { type: "image", image: image("valkey") },
      env: [
        `VALKEY_PASSWORD=${valkeyQueuePassword}`,
        `OA_VALKEY_CONF=/usr/local/etc/valkey/valkey-queue.conf`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "valkey-queue-data", mountPath: "/data" },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-valkey-realtime`,
      source: { type: "image", image: image("valkey") },
      env: [
        `VALKEY_PASSWORD=${valkeyRealtimePassword}`,
        `OA_VALKEY_CONF=/usr/local/etc/valkey/valkey-realtime.conf`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "valkey-realtime-data", mountPath: "/data" },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-keygen`,
      source: { type: "image", image: "alpine:3.21" },
      deploy: {
        command: `apk add --no-cache openssl >/dev/null && ${keygenCommand}`,
      },
      mounts: [
        { type: "volume", name: "keys-api", mountPath: "/keys/api" },
        { type: "volume", name: "keys-gateway", mountPath: "/keys/gateway" },
        { type: "volume", name: "keys-realtime", mountPath: "/keys/realtime" },
        {
          type: "volume",
          name: "keys-collector",
          mountPath: "/keys/collector",
        },
        { type: "volume", name: "keyring", mountPath: "/keyring" },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-geoip`,
      source: { type: "image", image: "alpine:3.21" },
      deploy: { command: geoipCommand },
      mounts: [{ type: "volume", name: "geoip", mountPath: "/geoip" }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-migrate`,
      source: { type: "image", image: image("migrate") },
      deploy: {
        command:
          'sh -c "node packages/postgres/dist/cli.js && node packages/clickhouse/dist/cli.js"',
      },
      env: [
        `ENVIRONMENT=production`,
        `POSTGRES_MIGRATION_URL=postgres://openanalytics:${postgresPassword}@${postgresHost}:5432/openanalytics`,
        `CLICKHOUSE_URL=http://${clickhouseHost}:8123`,
        `CLICKHOUSE_DATABASE=analytics`,
        `CLICKHOUSE_MIGRATION_USER=oa_migration`,
        `CLICKHOUSE_MIGRATION_PASSWORD=${clickhouseMigrationPassword}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-gateway`,
      source: { type: "image", image: image("query-gateway") },
      env: [
        ...nodeRuntimeEnv,
        `PORT=8081`,
        `CLICKHOUSE_URL=http://${clickhouseHost}:8123`,
        `CLICKHOUSE_DB=analytics`,
        `CLICKHOUSE_READ_USER=oa_read`,
        `CLICKHOUSE_READ_PASSWORD=${clickhouseReadPassword}`,
        `REALTIME_CACHE_REDIS_URL=redis://:${valkeyRealtimePassword}@${valkeyRealtimeHost}:6379`,
        `QUERY_SIGNING_KEY_ID=oa-selfhost-1`,
        `QUERY_SIGNING_PUBLIC_KEY_FILE=/keys/query.public.pem`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keys-gateway"),
          mountPath: "/keys",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-api`,
      source: { type: "image", image: image("api") },
      env: [
        ...nodeRuntimeEnv,
        `PORT=8082`,
        `DATABASE_URL=postgres://openanalytics:${postgresPassword}@${postgresHost}:5432/openanalytics`,
        `REALTIME_CACHE_REDIS_URL=redis://:${valkeyRealtimePassword}@${valkeyRealtimeHost}:6379`,
        `QUERY_GATEWAY_URL=http://${gatewayHost}:8081`,
        `AUTH_BASE_URL=https://${apiDomain}`,
        `APP_BASE_URL=https://${appDomain}`,
        `COLLECTOR_BASE_URL=https://${collectorDomain}`,
        `AUTH_TRUSTED_ORIGINS=https://${appDomain}`,
        `PRODUCT_NAME=Open Analytics`,
        `AUTH_SECRET=${authSecret}`,
        `TRIAL_IDENTITY_SECRET=${trialIdentitySecret}`,
        `CREDENTIAL_SOURCE_SECRET=${credentialSourceSecret}`,
        `OA_CREDENTIAL_KEYRING_FILE=/keyring/credential-keyring.json`,
        `QUERY_SIGNING_KEY_ID=oa-selfhost-1`,
        `AUTH_PASSWORD_SIGNIN=enabled`,
        `QUERY_SIGNING_PRIVATE_KEY_FILE=/keys/query.private.pem`,
        `REALTIME_TOKEN_SIGNING_KEY_FILE=/keys/realtime.private.pem`,
        `PREVIEW_TOKEN_SIGNING_KEY_FILE=/keys/preview.private.pem`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keys-api"),
          mountPath: "/keys",
        },
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keyring"),
          mountPath: "/keyring",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-collector`,
      source: { type: "image", image: image("collector") },
      env: [
        ...nodeRuntimeEnv,
        `PORT=8083`,
        `DATABASE_URL=postgres://openanalytics:${postgresPassword}@${postgresHost}:5432/openanalytics`,
        `EVENT_STREAM_REDIS_URL=redis://:${valkeyQueuePassword}@${valkeyQueueHost}:6379`,
        `REALTIME_CACHE_REDIS_URL=redis://:${valkeyRealtimePassword}@${valkeyRealtimeHost}:6379`,
        `ANONYMOUS_IDENTITY_SECRET=${anonymousIdentitySecret}`,
        `ANONYMOUS_IDENTITY_KEY_VERSION=1`,
        `PREVIEW_TOKEN_VERIFY_KEY_FILE=/keys/preview.public.pem`,
        `GEOIP_DB_PATH=/geoip/dbip-city-lite.mmdb`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keys-collector"),
          mountPath: "/keys",
        },
        {
          type: "bind",
          hostPath: appVolumePath("geoip", "geoip"),
          mountPath: "/geoip",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-realtime`,
      source: { type: "image", image: image("realtime") },
      env: [
        ...nodeRuntimeEnv,
        `PORT=8084`,
        `REALTIME_CACHE_REDIS_URL=redis://:${valkeyRealtimePassword}@${valkeyRealtimeHost}:6379`,
        `REALTIME_TOKEN_VERIFY_KEY_FILE=/keys/realtime.public.pem`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keys-realtime"),
          mountPath: "/keys",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-worker`,
      source: { type: "image", image: image("worker") },
      env: [
        ...nodeRuntimeEnv,
        `PORT=8085`,
        `DATABASE_URL=postgres://openanalytics:${postgresPassword}@${postgresHost}:5432/openanalytics`,
        `EVENT_STREAM_REDIS_URL=redis://:${valkeyQueuePassword}@${valkeyQueueHost}:6379`,
        `REALTIME_CACHE_REDIS_URL=redis://:${valkeyRealtimePassword}@${valkeyRealtimeHost}:6379`,
        `CLICKHOUSE_URL=http://${clickhouseHost}:8123`,
        `CLICKHOUSE_DB=analytics`,
        `CLICKHOUSE_INGEST_USER=oa_ingest`,
        `CLICKHOUSE_INGEST_PASSWORD=${clickhouseIngestPassword}`,
        `CLICKHOUSE_MAINTENANCE_USER=oa_maintenance`,
        `CLICKHOUSE_MAINTENANCE_PASSWORD=${clickhouseMaintenancePassword}`,
        `ANONYMOUS_IDENTITY_SECRET=${anonymousIdentitySecret}`,
        `ANONYMOUS_IDENTITY_KEY_VERSION=1`,
        `OA_CREDENTIAL_KEYRING_FILE=/keyring/credential-keyring.json`,
        `PRODUCT_NAME=Open Analytics`,
        `EMAIL_FROM=${input.emailFrom}`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: appVolumePath("keygen", "keyring"),
          mountPath: "/keyring",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-web`,
      source: { type: "image", image: image("web") },
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `NEXT_PUBLIC_API_URL=https://${apiDomain}`,
        `NEXT_PUBLIC_REALTIME_URL=https://${realtimeDomain}`,
        `NEXT_PUBLIC_COLLECTOR_URL=https://${collectorDomain}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-edge`,
      source: { type: "image", image: "caddy:2.9-alpine" },
      env: [
        `WEB_UPSTREAM=${webHost}:3000`,
        `API_UPSTREAM=${apiHost}:8082`,
        `COLLECTOR_UPSTREAM=${collectorHost}:8083`,
        `REALTIME_UPSTREAM=${realtimeHost}:8084`,
      ].join("\n"),
      mounts: [
        { type: "file", content: caddyfile, mountPath: "/etc/caddy/Caddyfile" },
      ],
      domains: [
        { host: appDomain, port: 80 },
        { host: apiDomain, port: 80 },
        { host: collectorDomain, port: 80 },
        { host: realtimeDomain, port: 80 },
      ],
    },
  });

  return { services };
}
