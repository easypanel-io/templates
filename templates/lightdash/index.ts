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
  const lightdashSecert = randomString(32);
  const crypto = require("crypto");
  const s3Bucket = "lightdash";
  const s3AccessKey = `GK${randomString(16)}`;
  const s3SecretKey = crypto.randomBytes(32).toString("hex");
  const garageRpcSecret = crypto.randomBytes(32).toString("hex");
  const garageAdminToken = crypto.randomBytes(32).toString("hex");
  const garageMetricsToken = crypto.randomBytes(32).toString("hex");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PGHOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `PGPORT=5432`,
        `PGUSER=postgres`,
        `PGPASSWORD=${databasePassword}`,
        `PGDATABASE=$(PROJECT_NAME)`,
        `SECURE_COOKIES=false`,
        `TRUST_PROXY=false`,
        `LIGHTDASH_SECRET=${lightdashSecert}`,
        // Required since v2 - the backend refuses to start without an
        // S3-compatible store for query result caching. Backed by the
        // bundled Garage service below.
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-garage:3900`,
        `S3_BUCKET=${s3Bucket}`,
        `S3_REGION=garage`,
        `S3_ACCESS_KEY=${s3AccessKey}`,
        `S3_SECRET_KEY=${s3SecretKey}`,
        `S3_FORCE_PATH_STYLE=true`,
        `PORT=8080`,
        `LIGHTDASH_LOG_LEVEL=debug`,
        `LIGHTDASH_INSTALL_ID=`,
        `LIGHTDASH_INSTALL_TYPE=docker_image`,
        `AUTH_DISABLE_PASSWORD_AUTHENTICATION=false`,
        `AUTH_ENABLE_GROUP_SYNC=false`,
        `AUTH_GOOGLE_ENABLED=false`,
        `AUTH_GOOGLE_OAUTH2_CLIENT_ID=`,
        `AUTH_GOOGLE_OAUTH2_CLIENT_SECRET=`,
        `SITE_URL=https://$(PRIMARY_DOMAIN)`,
        `EMAIL_SMTP_HOST=`,
        `EMAIL_SMTP_PORT=`,
        `EMAIL_SMTP_SECURE=false`,
        `EMAIL_SMTP_USER=`,
        `EMAIL_SMTP_PASSWORD=`,
        `EMAIL_SMTP_ALLOW_INVALID_CERT=false`,
        `EMAIL_SMTP_SENDER_NAME="Lightdash"`,
        `EMAIL_SMTP_SENDER_EMAIL=`,
        `ALLOW_MULTIPLE_ORGS=false`,
        `LIGHTDASH_QUERY_MAX_LIMIT=5000`,
        `LIGHTDASH_MAX_PAYLOAD=5mb`,
        `HEADLESS_BROWSER_HOST=$(PROJECT_NAME)_${input.appServiceName}-browserless`,
        `HEADLESS_BROWSER_PORT=3000`,
        `RUDDERSTACK_WRITE_KEY=`,
        `SCHEDULER_ENABLED=true`,
        `GROUPS_ENABLED=false`,
        `POSTHOG_PROJECT_API_KEY=`,
        `POSTHOG_FE_API_HOST=`,
        `POSTHOG_BE_API_HOST=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dbt",
          mountPath: "/usr/app/dbt",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-browserless`,
      source: {
        type: "image",
        image: `${input.browserlessImage}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  // MinIO's Docker images are no longer freely pullable (MinIO moved to a
  // licensed "AIStor" product). Garage is a genuinely open-source (AGPL),
  // MinIO-API-compatible object store; --single-node --default-bucket
  // auto-creates the access key and bucket on first boot.
  const garageToml = `metadata_dir = "/data/meta"
data_dir = "/data/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
rpc_secret = "${garageRpcSecret}"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "${garageAdminToken}"
metrics_token = "${garageMetricsToken}"`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-garage`,
      env: [
        `GARAGE_CONFIG_FILE=/etc/garage.toml`,
        `GARAGE_DEFAULT_ACCESS_KEY=${s3AccessKey}`,
        `GARAGE_DEFAULT_SECRET_KEY=${s3SecretKey}`,
        `GARAGE_DEFAULT_BUCKET=${s3Bucket}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.garageImage,
      },
      deploy: {
        command: "/garage server --single-node --default-bucket",
      },
      mounts: [
        {
          type: "volume",
          name: "garage-data",
          mountPath: "/data",
        },
        {
          type: "file",
          content: garageToml,
          mountPath: "/etc/garage.toml",
        },
      ],
    },
  });

  return { services };
}
