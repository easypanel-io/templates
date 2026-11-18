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
  const minioPassword = randomPassword();

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
        `S3_ENDPOINT=https://$(PROJECT_NAME)-${input.appServiceName}-minio.$(EASYPANEL_HOST)`,
        `S3_REGION=us-east-1`,
        `S3_BUCKET=default`,
        `S3_ACCESS_KEY=minioadmin`,
        `S3_SECRET_KEY=${minioPassword}`,
        `S3_FORCE_PATH_STYLE=true`,
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
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: {
        type: "image",
        image: input.minioImage,
      },
      env: [
        `MINIO_ROOT_USER=minioadmin`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
        `MINIO_DEFAULT_BUCKETS=default`,
        `MINIO_EXPIRATION_DAYS=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "file",
          content: initMinio,
          mountPath: "/init-minio.sh",
        },
      ],
      deploy: {
        command: "sh /init-minio.sh",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: "pgvector/pgvector:pg15",
    },
  });

  return { services };
}

const initMinio =
  '#!/bin/sh\nset -e\n\necho "Starting MinIO server in background..."\nminio server /data --console-address ":9001" &\n\n# Wait for MinIO API to be available\necho "Waiting for MinIO to become available..."\nuntil mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" 2>/dev/null; do\n  sleep 1\ndone\n\necho "MinIO is ready. Creating buckets..."\n\nIFS=\',\'\nfor bucket in $MINIO_DEFAULT_BUCKETS; do\n  if [ -n "$bucket" ]; then\n    if ! mc mb -p local/"$bucket" 2>/dev/null; then\n      echo "Bucket \'$bucket\' already exists or could not be created"\n    fi\n\n    # Configure lifecycle policy to auto-delete files after MINIO_EXPIRATION_DAYS days (default: 1 day)\n    EXPIRATION_DAYS="${MINIO_EXPIRATION_DAYS:-1}"\n    mc ilm rule rm --all --force local/"$bucket" 2>/dev/null || true\n    if [ "$EXPIRATION_DAYS" -gt 0 ] 2>/dev/null; then\n      echo "Setting lifecycle policy for bucket \'$bucket\': expire after $EXPIRATION_DAYS day(s)"\n      mc ilm rule add --expire-days "$EXPIRATION_DAYS" local/"$bucket" 2>/dev/null || \\\n        echo "Could not set lifecycle policy for bucket \'$bucket\'"\n    else\n      echo "Lifecycle expiration disabled for bucket \'$bucket\'"\n    fi\n  fi\ndone\n\n# Enable CORS so the browser can PUT directly to MinIO (presigned uploads)\necho "Configuring CORS for presigned uploads..."\ncat > /tmp/cors.xml << \'CORS\'\n<CORSConfiguration>\n  <CORSRule>\n    <AllowedOrigin>*</AllowedOrigin>\n    <AllowedMethod>GET</AllowedMethod>\n    <AllowedMethod>PUT</AllowedMethod>\n    <AllowedMethod>HEAD</AllowedMethod>\n    <AllowedHeader>*</AllowedHeader>\n    <ExposeHeader>ETag</ExposeHeader>\n  </CORSRule>\n</CORSConfiguration>\nCORS\n\nfor bucket in $MINIO_DEFAULT_BUCKETS; do\n  if [ -n "$bucket" ]; then\n    mc cors set local/"$bucket" /tmp/cors.xml 2>/dev/null || \\\n      echo "Could not set CORS for bucket \'$bucket\'"\n  fi\ndone\n\nwait\n';
