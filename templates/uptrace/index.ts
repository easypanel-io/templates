import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

const UPTRACE_CONFIG = (
  chHost: string,
  pgHost: string,
  pgPassword: string,
  redisHost: string,
  redisPassword: string,
  uptraceHost: string,
  adminName: string,
  adminEmail: string,
  adminPassword: string,
  orgName: string,
  projectName: string,
  projectToken: string
) => `
service:
  env: hosted
  secret: ${randomString(32)}

site:
  url: https://$(PRIMARY_DOMAIN)
  ingest_url: https://$(PRIMARY_DOMAIN)?grpc=14317

listen:
  http:
    addr: :80
  grpc:
    addr: :4317

auth: {}

seed_data:
  update: true
  delete: true
  users:
    - key: user1
      name: ${adminName}
      email: ${adminEmail}
      password: ${adminPassword}
      email_confirmed: true
  user_tokens:
    - key: user_token1
      user_key: user1
      token: ${randomString(32)}
  orgs:
    - key: org1
      name: ${orgName}
  org_users:
    - key: org_user1
      org_key: org1
      user_key: user1
      role: owner
  projects:
    - key: project1
      name: ${projectName}
      org_key: org1
  project_tokens:
    - key: project_token1
      project_key: project1
      token: "${projectToken}"
  project_users:
    - key: project_user1
      project_key: project1
      org_user_key: org_user1
      perm_level: admin

ch_cluster:
  cluster: uptrace1
  replicated: false
  distributed: false
  shards:
    - replicas:
        - addr: ${chHost}:9000
          database: uptrace
          user: uptrace
          password: uptrace

pg:
  addr: ${pgHost}:5432
  user: postgres
  password: ${pgPassword}
  database: $(PROJECT_NAME)

ch_schema:
  compression: ZSTD(1)
  spans_index: { storage_policy: default }
  spans_data: { storage_policy: default }
  span_links: { storage_policy: default }
  logs_index: { storage_policy: default }
  logs_data: { storage_policy: default }
  events_index: { storage_policy: default }
  events_data: { storage_policy: default }
  metrics: { storage_policy: default }

redis_cache:
  addrs:
    1: ${redisHost}:6379
  username: default
  password: ${redisPassword}
  db: 0

mailer:
  smtp:
    enabled: false
    host: localhost
    port: 1025
    username: mailhog
    password: mailhog
    from: no-reply@uptrace.local

self_monitoring:
  dsn: http://${projectToken}@${uptraceHost}:80?grpc=14317

logging:
  level: INFO
`;

const OTEL_COLLECTOR_CONFIG = (uptraceHost: string, projectToken: string) => `
extensions:
  health_check:

receivers:
  otlp:
    protocols:
      grpc:
      http:
  hostmetrics:
    collection_interval: 10s
    scrapers:
      cpu:
      disk:
      load:
      filesystem:
      memory:
      network:
      paging:

processors:
  resourcedetection:
    detectors: ['system']
  batch:
    send_batch_size: 10000
    timeout: 10s

exporters:
  otlp/uptrace:
    endpoint: http://${uptraceHost}:4317
    tls: { insecure_skip_verify: true }
    headers: { 'uptrace-dsn': 'http://${projectToken}@localhost?grpc=14317' }

service:
  telemetry:
    metrics:
      address: ':8888'
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/uptrace]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/uptrace]
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors: [batch, resourcedetection]
      exporters: [otlp/uptrace]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/uptrace]
  extensions: [health_check]
`;

const ALERTMANAGER_CONFIG = `
route:
  receiver: 'default'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h

receivers:
  - name: 'default'
`;

const VECTOR_CONFIG = (uptraceHost: string, projectToken: string) => `
[sources.syslog_logs]
type = "demo_logs"
format = "syslog"

[transforms.parse_logs]
type = "remap"
inputs = ["syslog_logs"]
source = '''
. = parse_syslog!(string!(.message))
'''

[sinks.uptrace]
type = "http"
method = "post"
inputs = ["parse_logs"]
encoding.codec = "json"
framing.method = "newline_delimited"
compression = "gzip"
uri = "http://${uptraceHost}:80/api/v1/vector/logs"
tls.verify_certificate = false
request.headers.uptrace-dsn = "http://${projectToken}@localhost?grpc=14317"
`;

const GRAFANA_DATASOURCE = (uptraceHost: string, projectToken: string) => `
apiVersion: 1

datasources:
  - name: Uptrace
    type: prometheus
    url: http://${uptraceHost}:80/api/v1/prometheus
    access: proxy
    isDefault: true
    jsonData:
      httpHeaderName1: 'uptrace-dsn'
    secureJsonData:
      httpHeaderValue1: 'http://${projectToken}@localhost?grpc=14317'
`;

const GRAFANA_INI = `
[security]
admin_user = admin
admin_password = admin

[users]
default_theme = dark
`;

const PROMETHEUS_CONFIG = (uptraceHost: string, projectToken: string) => `
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'uptrace'

scrape_configs:
  - job_name: 'prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9090']

remote_write:
  - url: 'http://${uptraceHost}:80/api/v1/prometheus/write'
    headers:
      'uptrace-dsn': 'http://${projectToken}@localhost?grpc=14317'
`;

const CLICKHOUSE_CONFIG = `
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id from_env="KEEPER_ID" />
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <server>
                <id from_env="KEEPER_ID" />
                <hostname>localhost</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
    <remote_servers>
        <uptrace1>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>localhost</host>
                    <port>9000</port>
                </replica>
            </shard>
        </uptrace1>
    </remote_servers>
    <macros>
        <cluster>uptrace1</cluster>
        <shard from_env="SHARD" />
        <replica from_env="REPLICA" />
    </macros>
</clickhouse>
`;

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = `${input.adminPassword || randomPassword()}`;
  const adminEmail = input.adminEmail || "admin@uptrace.local";
  const adminName = input.adminName || "Admin";

  const pgPassword = randomPassword();
  const redisPassword = randomPassword();
  const projectToken = randomString(32);

  const uptraceHost = `$(PROJECT_NAME)_${input.appServiceName}`;
  const chHost = `$(PROJECT_NAME)_${input.appServiceName}-clickhouse`;
  const pgHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const redisHost = `$(PROJECT_NAME)_${input.appServiceName}-redis`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],
      mounts: [
        {
          type: "file",
          content: UPTRACE_CONFIG(
            chHost,
            pgHost,
            pgPassword,
            redisHost,
            redisPassword,
            uptraceHost,
            adminName,
            adminEmail,
            adminPassword,
            input.orgName || "Org1",
            input.projectName || "Project1",
            projectToken
          ),
          mountPath: "/etc/uptrace/config.yml",
        },
      ],
      ports: [{ published: 14317, target: 4317 }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-clickhouse`,
      source: {
        type: "image",
        image: "clickhouse/clickhouse-server:25.8.15.35",
      },
      env: [
        "CLICKHOUSE_DB=uptrace",
        "CLICKHOUSE_USER=uptrace",
        "CLICKHOUSE_PASSWORD=uptrace",
        "SHARD=shard1",
        "REPLICA=replica1",
        "KEEPER_ID=1",
      ].join("\n"),
      mounts: [
        { type: "volume", name: "ch-data", mountPath: "/var/lib/clickhouse" },
        {
          type: "file",
          content: CLICKHOUSE_CONFIG,
          mountPath: "/etc/clickhouse-server/config.d/config.xml",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: pgPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-otelcol`,
      source: {
        type: "image",
        image: "otel/opentelemetry-collector-contrib:0.123.0",
      },
      mounts: [
        {
          type: "file",
          content: OTEL_COLLECTOR_CONFIG(uptraceHost, projectToken),
          mountPath: "/etc/otelcol-contrib/config.yaml",
        },
      ],
      ports: [
        { published: 4317, target: 4317 },
        { published: 4318, target: 4318 },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-alertmanager`,
      source: { type: "image", image: "prom/alertmanager:v0.24.0" },
      deploy: {
        command:
          "alertmanager --config.file=/etc/alertmanager/config.yml --storage.path=/alertmanager",
      },
      mounts: [
        {
          type: "file",
          content: ALERTMANAGER_CONFIG,
          mountPath: "/etc/alertmanager/config.yml",
        },
        {
          type: "volume",
          name: "alertmanager-data",
          mountPath: "/alertmanager",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-vector`,
      source: { type: "image", image: "timberio/vector:0.28.X-alpine" },
      mounts: [
        {
          type: "file",
          content: VECTOR_CONFIG(uptraceHost, projectToken),
          mountPath: "/etc/vector/vector.toml",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-grafana`,
      source: { type: "image", image: "grafana/grafana:12.0.0" },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      mounts: [
        {
          type: "file",
          content: GRAFANA_DATASOURCE(uptraceHost, projectToken),
          mountPath: "/etc/grafana/provisioning/datasources/datasource.yml",
        },
        {
          type: "file",
          content: GRAFANA_INI,
          mountPath: "/etc/grafana/grafana.ini",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-prometheus`,
      source: { type: "image", image: "prom/prometheus:v2.36.2" },
      deploy: {
        command: [
          "/bin/prometheus --config.file=/etc/prometheus/prometheus.yml",
          "--storage.tsdb.path=/prometheus",
          "--web.console.libraries=/usr/share/prometheus/console_libraries",
          "--web.console.templates=/usr/share/prometheus/consoles",
        ].join(" "),
      },
      mounts: [
        {
          type: "file",
          content: PROMETHEUS_CONFIG(uptraceHost, projectToken),
          mountPath: "/etc/prometheus/prometheus.yml",
        },
        {
          type: "volume",
          name: "prometheus-data",
          mountPath: "/prometheus",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-mailpit`,
      source: { type: "image", image: "axllent/mailpit" },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8025 }],
      env: [
        "MP_MAX_MESSAGES=5000",
        "MP_DATA_FILE=/data/mailpit.db",
        "MP_SMTP_AUTH_ACCEPT_ANY=1",
        "MP_SMTP_AUTH_ALLOW_INSECURE=1",
      ].join("\n"),
      mounts: [{ type: "volume", name: "mailpit-data", mountPath: "/data" }],
    },
  });

  return { services };
}
