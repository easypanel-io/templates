import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

const NGINX_CONFIG = (
  frontHost: string,
  accountHost: string,
  transactorHost: string,
  collaboratorHost: string,
  rekoniHost: string,
  statsHost: string,
  minioHost: string
) => `server {
  listen 80;
  server_name _;
  client_max_body_size 100M;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://${frontHost}:8080;
  }

  location /_accounts {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    rewrite ^/_accounts(/.*)$ $1 break;
    proxy_pass http://${accountHost}:3000/;
  }

  location /_transactor {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
    rewrite ^/_transactor(/.*)$ $1 break;
    proxy_pass http://${transactorHost}:3333/;
  }

  location ~ ^/eyJ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://${transactorHost}:3333;
  }

  location /_collaborator {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
    rewrite ^/_collaborator(/.*)$ $1 break;
    proxy_pass http://${collaboratorHost}:3078/;
  }

  location /_rekoni {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    rewrite ^/_rekoni(/.*)$ $1 break;
    proxy_pass http://${rekoniHost}:4004/;
  }

  location /_stats {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    rewrite ^/_stats(/.*)$ $1 break;
    proxy_pass http://${statsHost}:4900/;
  }

  location /files {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://${minioHost}:9000;
  }
}
`;

export function generate(input: Input): Output {
  const services: Services = [];

  const secret = randomString(64);
  const redpandaPassword = randomPassword();
  const hulyVersion = input.appServiceImage || "v0.7.382";

  const base = `$(PROJECT_NAME)_${input.appServiceName}`;
  const frontHost = `${base}-front`;
  const accountHost = `${base}-account`;
  const transactorHost = `${base}-transactor`;
  const collaboratorHost = `${base}-collaborator`;
  const rekoniHost = `${base}-rekoni`;
  const statsHost = `${base}-stats`;
  const minioHost = `${base}-minio`;
  const cockroachHost = `${base}-cockroach`;
  const elasticHost = `${base}-elastic`;
  const fulltextHost = `${base}-fulltext`;
  const redpandaHost = `${base}-redpanda`;

  const hostAddress = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: "nginx:1.21.3-alpine" },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],
      mounts: [
        {
          type: "file",
          content: NGINX_CONFIG(
            frontHost,
            accountHost,
            transactorHost,
            collaboratorHost,
            rekoniHost,
            statsHost,
            minioHost
          ),
          mountPath: "/etc/nginx/conf.d/default.conf",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cockroach`,
      source: {
        type: "image",
        image: "cockroachdb/cockroach:latest-v24.2",
      },
      deploy: {
        command:
          "/cockroach/cockroach start-single-node --accept-sql-without-tls --insecure",
      },
      env: ["COCKROACH_DATABASE=defaultdb"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "cr-data",
          mountPath: "/cockroach/cockroach-data",
        },
        { type: "volume", name: "cr-certs", mountPath: "/cockroach/certs" },
      ],
    },
  });

  const crDbUrl = `postgres://root@${cockroachHost}:26257/defaultdb?sslmode=disable`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redpanda`,
      source: {
        type: "image",
        image: "docker.redpanda.com/redpandadata/redpanda:v25.3.9",
      },
      deploy: {
        command: [
          "rpk",
          "redpanda",
          "start",
          "--kafka-addr",
          "internal://0.0.0.0:9092,external://0.0.0.0:19092",
          "--advertise-kafka-addr",
          `internal://${redpandaHost}:9092,external://localhost:19092`,
          "--pandaproxy-addr",
          "internal://0.0.0.0:8082,external://0.0.0.0:18082",
          "--advertise-pandaproxy-addr",
          `internal://${redpandaHost}:8082,external://localhost:18082`,
          "--schema-registry-addr",
          "internal://0.0.0.0:8081,external://0.0.0.0:18081",
          "--rpc-addr",
          "0.0.0.0:33145",
          "--advertise-rpc-addr",
          `${redpandaHost}:33145`,
          "--mode",
          "dev-container",
          "--smp",
          "1",
        ].join(" "),
      },
      env: [
        "REDPANDA_SUPERUSER_USERNAME=superadmin",
        `REDPANDA_SUPERUSER_PASSWORD=${redpandaPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "redpanda-data",
          mountPath: "/var/lib/redpanda/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: { type: "image", image: "minio/minio:latest" },
      deploy: {
        command: " minio server /data --address :9000 --console-address :9001",
      },
      mounts: [{ type: "volume", name: "files", mountPath: "/data" }],
    },
  });

  const storageConfig = `s3|http://${minioHost}:9000?accessKey=minioadmin&secretKey=minioadmin`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-elastic`,
      source: { type: "image", image: "elasticsearch:7.14.2" },
      deploy: {
        command:
          "./bin/elasticsearch-plugin list | grep -q ingest-attachment || yes | ./bin/elasticsearch-plugin install --silent ingest-attachment; /usr/local/bin/docker-entrypoint.sh eswrapper",
      },
      env: [
        "ELASTICSEARCH_PORT_NUMBER=9200",
        "discovery.type=single-node",
        "ES_JAVA_OPTS=-Xms1024m -Xmx1024m",
        "http.cors.enabled=true",
        "http.cors.allow-origin=*",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "elastic-data",
          mountPath: "/usr/share/elasticsearch/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rekoni`,
      source: {
        type: "image",
        image: `hardcoreeng/rekoni-service:${hulyVersion}`,
      },
      env: [`SECRET=${secret}`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-transactor`,
      source: {
        type: "image",
        image: `hardcoreeng/transactor:${hulyVersion}`,
      },
      env: [
        "SERVER_PORT=3333",
        `SERVER_SECRET=${secret}`,
        `DB_URL=${crDbUrl}`,
        `STORAGE_CONFIG=${storageConfig}`,
        `FRONT_URL=${hostAddress}`,
        `ACCOUNTS_URL=http://${accountHost}:3000`,
        `FULLTEXT_URL=http://${fulltextHost}:4700`,
        `STATS_URL=http://${statsHost}:4900`,
        "LAST_NAME_FIRST=true",
        `QUEUE_CONFIG=${redpandaHost}:9092`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-collaborator`,
      source: {
        type: "image",
        image: `hardcoreeng/collaborator:${hulyVersion}`,
      },
      env: [
        "COLLABORATOR_PORT=3078",
        `SECRET=${secret}`,
        `ACCOUNTS_URL=http://${accountHost}:3000`,
        `STATS_URL=http://${statsHost}:4900`,
        `STORAGE_CONFIG=${storageConfig}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-account`,
      source: {
        type: "image",
        image: `hardcoreeng/account:${hulyVersion}`,
      },
      env: [
        "SERVER_PORT=3000",
        `SERVER_SECRET=${secret}`,
        `DB_URL=${crDbUrl}`,
        `TRANSACTOR_URL=ws://${transactorHost}:3333;wss://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)/_transactor`,
        `STORAGE_CONFIG=${storageConfig}`,
        `FRONT_URL=${hostAddress}`,
        `STATS_URL=http://${statsHost}:4900`,
        "MODEL_ENABLED=*",
        `ACCOUNTS_URL=${hostAddress}/_accounts`,
        "ACCOUNT_PORT=3000",
        `QUEUE_CONFIG=${redpandaHost}:9092`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-workspace`,
      source: {
        type: "image",
        image: `hardcoreeng/workspace:${hulyVersion}`,
      },
      env: [
        `SERVER_SECRET=${secret}`,
        `DB_URL=${crDbUrl}`,
        `TRANSACTOR_URL=ws://${transactorHost}:3333;wss://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)/_transactor`,
        `STORAGE_CONFIG=${storageConfig}`,
        "MODEL_ENABLED=*",
        `ACCOUNTS_URL=http://${accountHost}:3000`,
        `STATS_URL=http://${statsHost}:4900`,
        `QUEUE_CONFIG=${redpandaHost}:9092`,
        `ACCOUNTS_DB_URL=${crDbUrl}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-front`,
      source: {
        type: "image",
        image: `hardcoreeng/front:${hulyVersion}`,
      },
      env: [
        "SERVER_PORT=8080",
        `SERVER_SECRET=${secret}`,
        `LOVE_ENDPOINT=${hostAddress}/_love`,
        `ACCOUNTS_URL=${hostAddress}/_accounts`,
        `ACCOUNTS_URL_INTERNAL=http://${accountHost}:3000`,
        `REKONI_URL=${hostAddress}/_rekoni`,
        `CALENDAR_URL=${hostAddress}/_calendar`,
        `GMAIL_URL=${hostAddress}/_gmail`,
        `TELEGRAM_URL=${hostAddress}/_telegram`,
        `STATS_URL=${hostAddress}/_stats`,
        "UPLOAD_URL=/files",
        `ELASTIC_URL=http://${elasticHost}:9200`,
        `COLLABORATOR_URL=wss://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)/_collaborator`,
        `STORAGE_CONFIG=${storageConfig}`,
        "TITLE=Huly Self Host",
        "DEFAULT_LANGUAGE=en",
        "LAST_NAME_FIRST=true",
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-fulltext`,
      source: {
        type: "image",
        image: `hardcoreeng/fulltext:${hulyVersion}`,
      },
      env: [
        `SERVER_SECRET=${secret}`,
        `DB_URL=${crDbUrl}`,
        `FULLTEXT_DB_URL=http://${elasticHost}:9200`,
        "ELASTIC_INDEX_NAME=huly_storage_index",
        `STORAGE_CONFIG=${storageConfig}`,
        `REKONI_URL=http://${rekoniHost}:4004`,
        `ACCOUNTS_URL=http://${accountHost}:3000`,
        `STATS_URL=http://${statsHost}:4900`,
        `QUEUE_CONFIG=${redpandaHost}:9092`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-stats`,
      source: {
        type: "image",
        image: `hardcoreeng/stats:${hulyVersion}`,
      },
      env: ["PORT=4900", `SERVER_SECRET=${secret}`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-kvs`,
      source: {
        type: "image",
        image: `hardcoreeng/hulykvs:${hulyVersion}`,
      },
      env: [
        `HULY_DB_CONNECTION=postgresql://root@${cockroachHost}:26257/defaultdb?sslmode=disable`,
        `HULY_TOKEN_SECRET=${secret}`,
      ].join("\n"),
      ports: [{ published: 8094, target: 8094 }],
    },
  });

  return { services };
}
