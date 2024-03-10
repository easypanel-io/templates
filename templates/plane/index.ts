import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

// @TODO: Fix ENV bugs
// 1. WEB_URL env in api/beat-worker/worker service is wrong
// 2. AWS_S3_ENDPOINT_URL env in api/beat-worker/worker service is wrong
// 3. Domains in minio service is wrong

export function generate(input: Input): Output {
  const services: Services = [];
  
  // @TODO: Make setting
  const redisPassword = randomPassword();
  const postgresPassword = randomPassword();

  // @TODO: Make setting
  const planeVersion = 'v0.16-dev';

  // @TODO: Make setting
  const mainDomain = "$(EASYPANEL_DOMAIN)";
  const minioConsoleDomain = "console-minio-$(EASYPANEL_DOMAIN)";
  const minioApiDomain = "api-minio-$(EASYPANEL_DOMAIN)";

  // @TODO: Make setting
  const minioRootUser = 'root';
  const minioRootPass = randomPassword();

  // @TODO: Make setting
  const sentryDsn = '';

  const instanceKey = randomPassword(64);
  const secretKey = randomPassword(64);

  const backendEnvironments = [
    '# All the available environments can be found going through https://github.com/makeplane/plane/tree/v0.16-dev/apiserver/plane/settings',
    '',
    'INSTANCE_KEY="' + instanceKey + '"',
    'SECRET_KEY="' + secretKey + '"',
    '',
    'DEBUG=0',
    '',
    'SENTRY_DSN="' + sentryDsn + '"',
    'SENTRY_ENVIRONMENT="production"',
    '',
    'DATABASE_URL="postgres://postgres:' + postgresPassword + '@' + input.projectName + '_db:5432/' + input.projectName + '"',
    'REDIS_URL="redis://default:' + redisPassword + '@' + input.projectName + '_redis:6379/"',
    '',
    'AWS_REGION=""',
    'AWS_ACCESS_KEY_ID="' + minioRootUser + '"',
    'AWS_SECRET_ACCESS_KEY="' + minioRootPass + '"',
    'AWS_S3_ENDPOINT_URL="https://' + minioApiDomain + '"',
    'AWS_S3_BUCKET_NAME="uploads"',
    'FILE_SIZE_LIMIT=5242880',
    'USE_MINIO=1',
    '',
    'WEB_URL="https://' + mainDomain + '"',
    '',
    'GUNICORN_WORKERS=2',
  ].join("\n");

  const minioEnvironments = [
    'MINIO_ROOT_USER="' + minioRootUser + '"',
    'MINIO_ROOT_PASSWORD="' + minioRootPass + '"',
  ].join("\n");

  const proxyEnvironment = [
    "FILE_SIZE_LIMIT=5242880",
    "BUCKET_NAME=uploads",
    '',
    'DOMAIN_NAME=' + mainDomain,
    '',
    'FRONTEND_HOST=http://' + input.projectName + '_web:3000/',
    'API_HOST=http://' + input.projectName + '_api:8000/api/',
    'SPACE_HOST=http://' + input.projectName + '_space/spaces/',
    'MINIO_HOST=http://' + input.projectName + '_minio:9000/uploads/',
  ].join("\n");

  const nginxConf = [
    'events {',
    '}',
    '',
    'http {',
    '    sendfile on;',
    '    server {',
    '        listen 80;',
    '        root /www/data/;',
    '',
    '        access_log /var/log/nginx/access.log;',
    '        client_max_body_size ${FILE_SIZE_LIMIT};',
    '',
    '        add_header X-Content-Type-Options    "nosniff" always;',
    '        add_header Referrer-Policy           "no-referrer-when-downgrade" always;',
    '        add_header Permissions-Policy        "interest-cohort=()" always;',
    '        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
    '',
    '        location / {',
    '            proxy_pass ${FRONTEND_HOST};',
    '        }',
    '',
    '        location /api/ {',
    '            proxy_pass ${API_HOST};',
    '            proxy_set_header Host \'${DOMAIN_NAME}\';',
    '        }',
    '',
    '        location /spaces/ {',
    '            rewrite ^/spaces/?$ /spaces/login break;',
    '            proxy_pass ${SPACE_HOST};',
    '        }',
    '',
    '        location /${BUCKET_NAME}/ {',
    '            proxy_pass ${MINIO_HOST};',
    '            proxy_set_header Host \'${DOMAIN_NAME}\';',
    '        }',
    '    }',
    '}',
  ].join("\n");

  const proxyEntrypoint = [
    "#!/bin/sh",
    "",
    'export dollar="$"',
    'export http_upgrade="http_upgrade"',
    'envsubst < /etc/nginx/nginx.conf.custom > /etc/nginx/nginx.conf',
    "exec nginx -g 'daemon off;'",
  ].join("\n");

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "api",
      "source": {
        "type": "image",
        "image": "makeplane/plane-backend:" + planeVersion
      },
      "env": backendEnvironments,
      "deploy": {
        "replicas": 1,
        "command": [
          "python manage.py wait_for_db",
          "python manage.py migrate",
          "./bin/takeoff"
        ].join(" && "),
        "zeroDowntime": true
      }
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "beat-worker",
      "source": {
        "type": "image",
        "image": "makeplane/plane-backend:" + planeVersion
      },
      "env": backendEnvironments,
      "deploy": {
        "replicas": 1,
        "command": "./bin/beat",
        "zeroDowntime": true
      }
    }
  });

  services.push({
    "type": "postgres",
    "data": {
      "projectName": input.projectName,
      "serviceName": "db",
      "image": "postgres:16",
      "password": postgresPassword
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "minio",
      "source": {
        "type": "image",
        "image": "minio/minio"
      },
      "env": minioEnvironments,
      "deploy": {
        "replicas": 1,
        "command": "minio server /export --console-address \":9090\"",
        "zeroDowntime": true
      },
      "domains": [
        {
          "host": minioApiDomain,
          "https": true,
          "port": 9000,
          "path": "/",
          "middlewares": []
        },
        {
          "host": minioConsoleDomain,
          "https": true,
          "port": 9090,
          "path": "/",
          "middlewares": []
        }
      ],
      "mounts": [
        {
          "type": "volume",
          "name": "uploads",
          "mountPath": "/export"
        }
      ]
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "proxy",
      "source": {
        "type": "image",
        "image": "makeplane/plane-proxy:" + planeVersion
      },
      "env": proxyEnvironment,
      "deploy": {
        "replicas": 1,
        "command": "sh /custom-docker-entrypoint.sh",
        "zeroDowntime": true
      },
      "domains": [
        {
          "host": mainDomain,
          "https": true,
          "port": 80,
          "path": "/",
          "middlewares": []
        }
      ],
      "mounts": [
        {
          "type": "file",
          "content": proxyEntrypoint,
          "mountPath": "/custom-docker-entrypoint.sh"
        },
        {
          "type": "file",
          "content": nginxConf,
          "mountPath": "/etc/nginx/nginx.conf.custom"
        }
      ]
    }
  });

  services.push({
    "type": "redis",
    "data": {
      "projectName": input.projectName,
      "serviceName": "redis",
      "image": "redis:7",
      "password": redisPassword
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "space",
      "source": {
        "type": "image",
        "image": "makeplane/plane-space:" + planeVersion
      },
      "deploy": {
        "replicas": 1,
        "command": "/usr/local/bin/start.sh space/server.js space",
        "zeroDowntime": true
      }
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "web",
      "source": {
        "type": "image",
        "image": "makeplane/plane-frontend:" + planeVersion
      },
      "deploy": {
        "replicas": 1,
        "command": "/usr/local/bin/start.sh web/server.js web",
        "zeroDowntime": true
      }
    }
  });

  services.push({
    "type": "app",
    "data": {
      "projectName": input.projectName,
      "serviceName": "worker",
      "source": {
        "type": "image",
        "image": "makeplane/plane-backend:" + planeVersion
      },
      "env": backendEnvironments,
      "deploy": {
        "replicas": 1,
        "command": "./bin/worker",
        "zeroDowntime": true
      }
    }
  });

  return { services };
}
