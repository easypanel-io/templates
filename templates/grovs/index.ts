import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

// Use Web Crypto: generated database, OAuth and encryption keys must be unpredictable.
function secret(): string {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
const baseEnv = {
  SERVER_HOST_PROTOCOL: "https://",
  REACT_HOST_PROTOCOL: "https://",
  POSTGRES_USER: "grovs",
  POSTGRES_DB: "grovs_production",
  POSTGRES_MAX_CONNECTIONS: "200",
  CLICKHOUSE_WRITE_ENABLED: "true",
  CLICKHOUSE_READ_ENABLED: "true",
  CLICKHOUSE_PRIMARY: "true",
  CLICKHOUSE_ANALYTICS_ROLLUPS_READ_ENABLED: "true",
  CLICKHOUSE_ATTRIBUTION_READ_ENABLED: "true",
  CLICKHOUSE_LINK_DIMENSIONS_READ_ENABLED: "true",
  REVENUE_READS_FROM_LEDGER: "true",
  CLICKHOUSE_ROLLUP_FAST_LANE: "true",
  DASHBOARD_CACHE_TTL_SECONDS: "60",
  PG_SHADOW_WRITES: "false",
  WEB_CONCURRENCY: "2",
  RAILS_MAX_THREADS: "5",
  RAILS_DB_POOL: "10",
  SIDEKIQ_EVENTS_CONCURRENCY: "10",
  ACTIVE_STORAGE_SERVICE: "amazon",
  PUBLIC_GO_PROJECT_IDENTIFIER: "go-self-hosted",
  DEFAULT_LOGO_URL:
    "https://appssemble-assets.s3.eu-north-1.amazonaws.com/linksquared/logo-square-new.svg",
  DEFAULT_SOCIAL_PREVIEW_URL:
    "https://appssemble-assets.s3.eu-north-1.amazonaws.com/linksquared/social-media-placeholder.jpg",
  DEFAULT_LINK_TITLE: "grovs",
  DEFAULT_LINK_SUBTITLE:
    "Dynamic links, attributions, and referrals across mobile and web platforms.",
  MAILER_DELIVERY_METHOD: "",
  SMTP_ADDRESS: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USERNAME: "",
  SMTP_PASSWORD: "",
  SMTP_AUTHENTICATION: "plain",
  SMTP_ENABLE_STARTTLS_AUTO: "true",
  RAILS_ENV: "production",
  GROVS_SELF_HOSTED: "true",
  GROVS_EE: "false",
  RAILS_LOG_TO_STDOUT: "true",
  RAILS_SERVE_STATIC_FILES: "true",
  CLICKHOUSE_DATABASE: "grovs_production",
  PORT: "3000",
};
const images = {
  postgres: "postgres:16.10-alpine",
  redis: "redis:7.4.5-alpine",
  clickhouse: "clickhouse/clickhouse-server:25.3.6.56",
  web: "ghcr.io/grovs-io/backend:2.3.1",
  dashboard: "ghcr.io/grovs-io/dashboard:2.3.1",
};
const commands = {
  migrate:
    'bash -ec \'#!/usr/bin/env bash\n# Sourced into the commands embedded in Railway/Render configuration.\n# No files from this repository need to be present in the application image.\nset -eu\n: "${SERVER_HOST:?Set your app domain}"\n: "${DOMAIN_LIVE:?Set your production links domain}"\n: "${DOMAIN_TEST:?Set your test links domain}"\nexport ACTIVE_STORAGE_SERVICE="${ACTIVE_STORAGE_SERVICE:-amazon}"\nif [ "$ACTIVE_STORAGE_SERVICE" = amazon ]; then\n  : "${AWS_S3_KEY_ID:?Set object storage credentials}"\n  : "${AWS_S3_ACCESS_KEY:?Set object storage credentials}"\n  : "${AWS_S3_REGION:?Set your bucket region}"\n  : "${AWS_S3_BUCKET:?Set your bucket name}"\nfi\nexport SERVER_HOST_PROTOCOL=https:// REACT_HOST_PROTOCOL=https://\nexport REACT_HOST="dashboard.$SERVER_HOST"\nexport API_HOST="api.$SERVER_HOST" SDK_HOST="sdk.$SERVER_HOST"\nexport DASHBOARD_HOST="$REACT_HOST" MCP_HOST="mcp.$SERVER_HOST" GO_HOST="go.$SERVER_HOST"\nexport PREVIEW_HOST="preview.$SERVER_HOST"\nexport LINKS_PROD_HOST="links.$DOMAIN_LIVE" LINKS_TEST_HOST="links.$DOMAIN_TEST"\nexport PREVIEW_BASE_URL="https://preview.$SERVER_HOST"\nexport MCP_CONSENT_URL="https://dashboard.$SERVER_HOST/mcp/authorize"\nexport S3_ASSET_PREFIX="https://api.$SERVER_HOST"\nencode_password() {\n  ruby -ruri -e \'"\'"\'print URI.encode_www_form_component(ENV.fetch(ARGV.fetch(0))).gsub("+", "%20")\'"\'"\' "$1"\n}\nif [ -z "${DATABASE_URL:-}" ]; then\n  : "${POSTGRES_HOST:?Set the private PostgreSQL host}"\n  DATABASE_URL="postgres://grovs:$(encode_password POSTGRES_PASSWORD)@$POSTGRES_HOST:5432/grovs_production"\n  export DATABASE_URL\nfi\nif [ -z "${REDIS_URL:-}" ]; then\n  : "${REDIS_HOST:?Set the private Redis host}"\n  REDIS_URL="redis://:$(encode_password REDIS_PASSWORD)@$REDIS_HOST:6379/0"\n  export REDIS_URL\nfi\nif [ -z "${CLICKHOUSE_URL:-}" ]; then\n  : "${CLICKHOUSE_HOST:?Set the private ClickHouse host}"\n  : "${CLICKHOUSE_PASSWORD:?Set the ClickHouse password}"\n  ENCODED_PASSWORD=$(encode_password CLICKHOUSE_PASSWORD)\n  export CLICKHOUSE_URL="http://grovs:$ENCODED_PASSWORD@$CLICKHOUSE_HOST:8123"\nfi\n\nwait_for_http() {\n  local attempt\n  for ((attempt=0; attempt<120; attempt++)); do\n    if curl --fail --silent --max-time 5 "$1" >/dev/null; then return 0; fi\n    sleep 5\n  done\n  echo "Dependency did not become healthy within the startup window." >&2\n  return 1\n}\n\nwait_for_http "http://$CLICKHOUSE_HOST:8123/ping"\nbin/rails db:prepare && bin/rails db:seed && bin/rails clickhouse:setup\'',
  web: 'bash -ec \'#!/usr/bin/env bash\n# Sourced into the commands embedded in Railway/Render configuration.\n# No files from this repository need to be present in the application image.\nset -eu\n: "${SERVER_HOST:?Set your app domain}"\n: "${DOMAIN_LIVE:?Set your production links domain}"\n: "${DOMAIN_TEST:?Set your test links domain}"\nexport ACTIVE_STORAGE_SERVICE="${ACTIVE_STORAGE_SERVICE:-amazon}"\nif [ "$ACTIVE_STORAGE_SERVICE" = amazon ]; then\n  : "${AWS_S3_KEY_ID:?Set object storage credentials}"\n  : "${AWS_S3_ACCESS_KEY:?Set object storage credentials}"\n  : "${AWS_S3_REGION:?Set your bucket region}"\n  : "${AWS_S3_BUCKET:?Set your bucket name}"\nfi\nexport SERVER_HOST_PROTOCOL=https:// REACT_HOST_PROTOCOL=https://\nexport REACT_HOST="dashboard.$SERVER_HOST"\nexport API_HOST="api.$SERVER_HOST" SDK_HOST="sdk.$SERVER_HOST"\nexport DASHBOARD_HOST="$REACT_HOST" MCP_HOST="mcp.$SERVER_HOST" GO_HOST="go.$SERVER_HOST"\nexport PREVIEW_HOST="preview.$SERVER_HOST"\nexport LINKS_PROD_HOST="links.$DOMAIN_LIVE" LINKS_TEST_HOST="links.$DOMAIN_TEST"\nexport PREVIEW_BASE_URL="https://preview.$SERVER_HOST"\nexport MCP_CONSENT_URL="https://dashboard.$SERVER_HOST/mcp/authorize"\nexport S3_ASSET_PREFIX="https://api.$SERVER_HOST"\nencode_password() {\n  ruby -ruri -e \'"\'"\'print URI.encode_www_form_component(ENV.fetch(ARGV.fetch(0))).gsub("+", "%20")\'"\'"\' "$1"\n}\nif [ -z "${DATABASE_URL:-}" ]; then\n  : "${POSTGRES_HOST:?Set the private PostgreSQL host}"\n  DATABASE_URL="postgres://grovs:$(encode_password POSTGRES_PASSWORD)@$POSTGRES_HOST:5432/grovs_production"\n  export DATABASE_URL\nfi\nif [ -z "${REDIS_URL:-}" ]; then\n  : "${REDIS_HOST:?Set the private Redis host}"\n  REDIS_URL="redis://:$(encode_password REDIS_PASSWORD)@$REDIS_HOST:6379/0"\n  export REDIS_URL\nfi\nif [ -z "${CLICKHOUSE_URL:-}" ]; then\n  : "${CLICKHOUSE_HOST:?Set the private ClickHouse host}"\n  : "${CLICKHOUSE_PASSWORD:?Set the ClickHouse password}"\n  ENCODED_PASSWORD=$(encode_password CLICKHOUSE_PASSWORD)\n  export CLICKHOUSE_URL="http://grovs:$ENCODED_PASSWORD@$CLICKHOUSE_HOST:8123"\nfi\n\nwait_for_http() {\n  local attempt\n  for ((attempt=0; attempt<120; attempt++)); do\n    if curl --fail --silent --max-time 5 "$1" >/dev/null; then return 0; fi\n    sleep 5\n  done\n  echo "Dependency did not become healthy within the startup window." >&2\n  return 1\n}\n\nruby -rpg -e \'"\'"\'120.times do\n  begin\n    PG.connect(ENV.fetch("DATABASE_URL"), connect_timeout: 5).close\n    exit 0\n  rescue PG::Error\n    sleep 5\n  end\nend\nabort "PostgreSQL did not become ready"\'"\'"\'\n\nwait_for_http "http://$CLICKHOUSE_HOST:8123/ping"\nbin/rails db:prepare\nbin/rails db:seed\nbin/rails clickhouse:setup\nexec bundle exec puma -b "tcp://0.0.0.0:${PORT:-3000}"\'',
  "worker-1":
    'bash -ec \'#!/usr/bin/env bash\n# Sourced into the commands embedded in Railway/Render configuration.\n# No files from this repository need to be present in the application image.\nset -eu\n: "${SERVER_HOST:?Set your app domain}"\n: "${DOMAIN_LIVE:?Set your production links domain}"\n: "${DOMAIN_TEST:?Set your test links domain}"\nexport ACTIVE_STORAGE_SERVICE="${ACTIVE_STORAGE_SERVICE:-amazon}"\nif [ "$ACTIVE_STORAGE_SERVICE" = amazon ]; then\n  : "${AWS_S3_KEY_ID:?Set object storage credentials}"\n  : "${AWS_S3_ACCESS_KEY:?Set object storage credentials}"\n  : "${AWS_S3_REGION:?Set your bucket region}"\n  : "${AWS_S3_BUCKET:?Set your bucket name}"\nfi\nexport SERVER_HOST_PROTOCOL=https:// REACT_HOST_PROTOCOL=https://\nexport REACT_HOST="dashboard.$SERVER_HOST"\nexport API_HOST="api.$SERVER_HOST" SDK_HOST="sdk.$SERVER_HOST"\nexport DASHBOARD_HOST="$REACT_HOST" MCP_HOST="mcp.$SERVER_HOST" GO_HOST="go.$SERVER_HOST"\nexport PREVIEW_HOST="preview.$SERVER_HOST"\nexport LINKS_PROD_HOST="links.$DOMAIN_LIVE" LINKS_TEST_HOST="links.$DOMAIN_TEST"\nexport PREVIEW_BASE_URL="https://preview.$SERVER_HOST"\nexport MCP_CONSENT_URL="https://dashboard.$SERVER_HOST/mcp/authorize"\nexport S3_ASSET_PREFIX="https://api.$SERVER_HOST"\nencode_password() {\n  ruby -ruri -e \'"\'"\'print URI.encode_www_form_component(ENV.fetch(ARGV.fetch(0))).gsub("+", "%20")\'"\'"\' "$1"\n}\nif [ -z "${DATABASE_URL:-}" ]; then\n  : "${POSTGRES_HOST:?Set the private PostgreSQL host}"\n  DATABASE_URL="postgres://grovs:$(encode_password POSTGRES_PASSWORD)@$POSTGRES_HOST:5432/grovs_production"\n  export DATABASE_URL\nfi\nif [ -z "${REDIS_URL:-}" ]; then\n  : "${REDIS_HOST:?Set the private Redis host}"\n  REDIS_URL="redis://:$(encode_password REDIS_PASSWORD)@$REDIS_HOST:6379/0"\n  export REDIS_URL\nfi\nif [ -z "${CLICKHOUSE_URL:-}" ]; then\n  : "${CLICKHOUSE_HOST:?Set the private ClickHouse host}"\n  : "${CLICKHOUSE_PASSWORD:?Set the ClickHouse password}"\n  ENCODED_PASSWORD=$(encode_password CLICKHOUSE_PASSWORD)\n  export CLICKHOUSE_URL="http://grovs:$ENCODED_PASSWORD@$CLICKHOUSE_HOST:8123"\nfi\n\nwait_for_http() {\n  local attempt\n  for ((attempt=0; attempt<120; attempt++)); do\n    if curl --fail --silent --max-time 5 "$1" >/dev/null; then return 0; fi\n    sleep 5\n  done\n  echo "Dependency did not become healthy within the startup window." >&2\n  return 1\n}\n\nwait_for_http "http://$WEB_HOST:${WEB_PORT:-3000}/up"\npids=()\ntrap \'"\'"\'kill "${pids[@]}" 2>/dev/null || true\'"\'"\' EXIT\ntrap \'"\'"\'exit 143\'"\'"\' TERM INT\nbundle exec sidekiq -C config/sidekiq_scheduler.yml &\npids+=($!)\nbundle exec sidekiq -C config/sidekiq_worker.yml &\npids+=($!)\nbundle exec sidekiq -C config/sidekiq_batch.yml &\npids+=($!)\nwait -n\n\'',
  "worker-2":
    'bash -ec \'#!/usr/bin/env bash\n# Sourced into the commands embedded in Railway/Render configuration.\n# No files from this repository need to be present in the application image.\nset -eu\n: "${SERVER_HOST:?Set your app domain}"\n: "${DOMAIN_LIVE:?Set your production links domain}"\n: "${DOMAIN_TEST:?Set your test links domain}"\nexport ACTIVE_STORAGE_SERVICE="${ACTIVE_STORAGE_SERVICE:-amazon}"\nif [ "$ACTIVE_STORAGE_SERVICE" = amazon ]; then\n  : "${AWS_S3_KEY_ID:?Set object storage credentials}"\n  : "${AWS_S3_ACCESS_KEY:?Set object storage credentials}"\n  : "${AWS_S3_REGION:?Set your bucket region}"\n  : "${AWS_S3_BUCKET:?Set your bucket name}"\nfi\nexport SERVER_HOST_PROTOCOL=https:// REACT_HOST_PROTOCOL=https://\nexport REACT_HOST="dashboard.$SERVER_HOST"\nexport API_HOST="api.$SERVER_HOST" SDK_HOST="sdk.$SERVER_HOST"\nexport DASHBOARD_HOST="$REACT_HOST" MCP_HOST="mcp.$SERVER_HOST" GO_HOST="go.$SERVER_HOST"\nexport PREVIEW_HOST="preview.$SERVER_HOST"\nexport LINKS_PROD_HOST="links.$DOMAIN_LIVE" LINKS_TEST_HOST="links.$DOMAIN_TEST"\nexport PREVIEW_BASE_URL="https://preview.$SERVER_HOST"\nexport MCP_CONSENT_URL="https://dashboard.$SERVER_HOST/mcp/authorize"\nexport S3_ASSET_PREFIX="https://api.$SERVER_HOST"\nencode_password() {\n  ruby -ruri -e \'"\'"\'print URI.encode_www_form_component(ENV.fetch(ARGV.fetch(0))).gsub("+", "%20")\'"\'"\' "$1"\n}\nif [ -z "${DATABASE_URL:-}" ]; then\n  : "${POSTGRES_HOST:?Set the private PostgreSQL host}"\n  DATABASE_URL="postgres://grovs:$(encode_password POSTGRES_PASSWORD)@$POSTGRES_HOST:5432/grovs_production"\n  export DATABASE_URL\nfi\nif [ -z "${REDIS_URL:-}" ]; then\n  : "${REDIS_HOST:?Set the private Redis host}"\n  REDIS_URL="redis://:$(encode_password REDIS_PASSWORD)@$REDIS_HOST:6379/0"\n  export REDIS_URL\nfi\nif [ -z "${CLICKHOUSE_URL:-}" ]; then\n  : "${CLICKHOUSE_HOST:?Set the private ClickHouse host}"\n  : "${CLICKHOUSE_PASSWORD:?Set the ClickHouse password}"\n  ENCODED_PASSWORD=$(encode_password CLICKHOUSE_PASSWORD)\n  export CLICKHOUSE_URL="http://grovs:$ENCODED_PASSWORD@$CLICKHOUSE_HOST:8123"\nfi\n\nwait_for_http() {\n  local attempt\n  for ((attempt=0; attempt<120; attempt++)); do\n    if curl --fail --silent --max-time 5 "$1" >/dev/null; then return 0; fi\n    sleep 5\n  done\n  echo "Dependency did not become healthy within the startup window." >&2\n  return 1\n}\n\nwait_for_http "http://$WEB_HOST:${WEB_PORT:-3000}/up"\npids=()\ntrap \'"\'"\'kill "${pids[@]}" 2>/dev/null || true\'"\'"\' EXIT\ntrap \'"\'"\'exit 143\'"\'"\' TERM INT\nbundle exec sidekiq -C config/sidekiq_maintenance.yml &\npids+=($!)\nbundle exec sidekiq -C config/sidekiq_device_updates.yml &\npids+=($!)\nwait -n\n\'',
};
const secretKeys = [
  "POSTGRES_PASSWORD",
  "CLICKHOUSE_PASSWORD",
  "SECRET_KEY_BASE",
  "ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY",
  "ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY",
  "ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT",
  "ADMIN_API_KEY",
  "DIAGNOSTICS_API_KEY",
  "SENT_QUOTAS_WEBHOOK_KEY",
  "OAUTH_CLIENT_UID",
  "OAUTH_CLIENT_SECRET",
  "BOOTSTRAP_ADMIN_PASSWORD",
  "REDIS_PASSWORD",
];
const fields = {
  appDomain: "SERVER_HOST",
  linksDomain: "DOMAIN_LIVE",
  testDomain: "DOMAIN_TEST",
  adminEmail: "BOOTSTRAP_ADMIN_EMAIL",
  s3Key: "AWS_S3_KEY_ID",
  s3Secret: "AWS_S3_ACCESS_KEY",
  s3Region: "AWS_S3_REGION",
  s3Bucket: "AWS_S3_BUCKET",
  s3Endpoint: "S3_ENDPOINT",
};
export function generate(input: Input): Output {
  for (const value of Object.values(input)) {
    if (typeof value === "string" && /[\r\n]/.test(value))
      throw new Error("Values must be a single line");
  }
  const services: Services = [];
  const env: Record<string, string> = { ...baseEnv };
  for (const key of secretKeys) env[key] = secret();
  for (const [field, key] of Object.entries(fields))
    env[key] = String(input[field as keyof Input] || "");
  env.ACTIVE_STORAGE_SERVICE = input.s3Bucket ? "amazon" : "local";
  // Easypanel's project_service names contain an underscore, which Ruby rejects in URLs; use the service alias.
  const host = (role: string) => `${input.servicePrefix}-${role}`;
  Object.assign(env, {
    POSTGRES_HOST: host("postgres"),
    REDIS_HOST: host("redis"),
    CLICKHOUSE_HOST: host("clickhouse"),
    WEB_HOST: host("web"),
    WEB_PORT: "3000",
    SMTP_DOMAIN: input.appDomain,
    MAILER_FROM: `Grovs <noreply@${input.appDomain}>`,
  });
  const add = (
    role: string,
    image: string,
    values: Record<string, string>,
    command?: string,
    volume?: string,
    mounts: any[] = []
  ) => {
    services.push({
      type: "app",
      data: {
        serviceName: `${input.servicePrefix}-${role}`,
        source: { type: "image", image },
        env: Object.entries(values)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n"),
        deploy: { command: command || null, replicas: 1, zeroDowntime: false },
        mounts: volume
          ? [{ type: "volume", name: "data", mountPath: volume }]
          : mounts,
      },
    });
  };
  add(
    "postgres",
    images.postgres,
    {
      POSTGRES_DB: "grovs_production",
      POSTGRES_USER: "grovs",
      POSTGRES_PASSWORD: env.POSTGRES_PASSWORD,
    },
    undefined,
    "/var/lib/postgresql/data"
  );
  add(
    "redis",
    images.redis,
    {},
    `redis-server --appendonly yes --maxmemory-policy noeviction --requirepass ${env.REDIS_PASSWORD}`,
    "/data"
  );
  add(
    "clickhouse",
    images.clickhouse,
    {
      CLICKHOUSE_DB: "grovs_production",
      CLICKHOUSE_USER: "grovs",
      CLICKHOUSE_PASSWORD: env.CLICKHOUSE_PASSWORD,
    },
    undefined,
    "/var/lib/clickhouse"
  );
  // Easypanel stores the web volume in this host folder; workers bind it to share uploads.
  add("web", images.web, env, commands.web, undefined, [
    { type: "volume", name: "storage", mountPath: "/app/storage" },
  ]);
  const shared = [
    {
      type: "bind",
      hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.servicePrefix}-web/volumes/storage`,
      mountPath: "/app/storage",
    },
  ];
  for (const role of ["worker-1", "worker-2"] as const)
    add(role, images.web, env, commands[role], undefined, shared);
  add("dashboard", images.dashboard, {
    API_URL: `https://api.${input.appDomain}`,
    OAUTH_CLIENT_UID: env.OAUTH_CLIENT_UID,
    OAUTH_CLIENT_SECRET: env.OAUTH_CLIENT_SECRET,
    HOSTNAME: "0.0.0.0",
    PORT: "3000",
  });
  // Explicit hosts get HTTPS. Wildcard certificates need a DNS challenge resolver, see the guide.
  const web = services.find(
    (s) => s.data.serviceName === `${input.servicePrefix}-web`
  )!;
  // Wildcard domains carry the per-project link hosts, including links.<domain>.
  if (web.type === "app")
    web.data.domains = [
      ...["api", "sdk", "mcp", "go", "preview"].map((prefix) => ({
        host: `${prefix}.${input.appDomain}`,
        port: 3000,
        https: true,
      })),
      ...[input.linksDomain, input.testDomain].map((host) => ({
        host,
        port: 3000,
        https: true,
        wildcard: true,
      })),
    ];
  const dashboard = services[services.length - 1];
  if (dashboard.type === "app")
    dashboard.data.domains = [
      { host: `dashboard.${input.appDomain}`, port: 3000, https: true },
    ];
  return { services };
}
