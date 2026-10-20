import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const redisPassword = randomPassword();
  const djangoSecret = randomString(50);

  const nginxServiceName = `${input.appServiceName}-nginx`;
  const uwsgiServiceName = `${input.appServiceName}-uwsgi`;
  const daphneServiceName = `${input.appServiceName}-daphne`;
  const celeryBeatServiceName = `${input.appServiceName}-celery-beat`;
  const celeryWorkerServiceName = `${input.appServiceName}-celery-worker`;
  const migrateServiceName = `${input.appServiceName}-migrate`;
  const dbServiceName = `${input.appServiceName}-db`;
  const cacheServiceName = `${input.appServiceName}-cache`;

  const dbUrl = {
    host: `$(PROJECT_NAME)_${dbServiceName}`,
    name: `$(PROJECT_NAME)`,
  };
  const cacheHost = `$(PROJECT_NAME)-${cacheServiceName}`;

  const sharedEnv = [
    `DJANGO_SECRET=${djangoSecret}`,
    `DB_HOST=${dbUrl.host}`,
    `DB_PORT=5432`,
    `DB_USER=postgres`,
    `DB_PASSWORD=${dbPassword}`,
    `DB_SSL=False`,
    `DB_NAME=${dbUrl.name}`,
    `LOCAL_STORAGE=True`,
    `STAGE=production`,
    `DEBUG=False`,
    `HTTPS_ENABLED=True`,
    `PUBLIC_DEPLOYMENT=False`,
    `LDAP_ENABLED=False`,
    `OLD_JOBS_RETENTION_DAYS=14`,
    `INTELOWL_WEB_CLIENT_DOMAIN=$(EASYPANEL_DOMAIN)`,
    `DEFAULT_FROM_EMAIL=noreply@$(EASYPANEL_DOMAIN)`,
    `DEFAULT_EMAIL=noreply@$(EASYPANEL_DOMAIN)`,
    `BROKER_URL=redis://default:${redisPassword}@${cacheHost}:6379/1`,
    `WEBSOCKETS_URL=redis://default:${redisPassword}@${cacheHost}:6379/0`,
  ].join("\n");

  const uwsgiStartScript = `#!/bin/sh
until cd /opt/deploy/intel_owl
do
    echo "Waiting for server volume..."
done
mkdir -p /var/log/intel_owl/django /var/log/intel_owl/uwsgi /var/log/intel_owl/asgi /opt/deploy/files_required/blint /opt/deploy/files_required/yara
chown -R www-data:www-data /var/log/intel_owl/django /var/log/intel_owl/uwsgi /var/log/intel_owl/asgi /opt/deploy/files_required/blint /opt/deploy/files_required/yara

python manage.py createcachetable
python manage.py migrate --fake-initial
python manage.py collectstatic --noinput

/usr/local/bin/uwsgi --ini /etc/uwsgi/sites/intel_owl.ini --stats 127.0.0.1:1717 --stats-http
`;

  const intelOwlIni = `[uwsgi]
project = intel_owl
base = /opt/deploy/intel_owl

chdir = %(base)
module = %(project).wsgi:application

master = true
processes = 12
enable-threads = true

socket = 0.0.0.0:8001
chown = www-data:www-data
vacuum = true
single-interpreter = true
harakiri = 300

logto = /var/log/intel_owl/uwsgi/intel_owl.log
uid = www-data
gid = www-data

max-requests = 1000
max-worker-lifetime = 3600
reload-on-rss = 2048
worker-reload-mercy = 3600

buffer-size = 32768

need-app = true
`;

  const nginxHttpConf = `upstream django {
    server $(PROJECT_NAME)_${uwsgiServiceName}:8001 fail_timeout=30s;
}

limit_req_zone $binary_remote_addr zone=adminlimit:10m rate=1r/s;

server {
    listen 80;
    server_name _;

    server_tokens off;

    include locations.conf;
    include errors.conf;
}
`;

  const nginxLocationsConf = `location = /favicon.ico {
    access_log off;
    log_not_found off;
}

location /hc {
    return 200;
}

location / {
    root /;
    uwsgi_pass                  django;
    uwsgi_pass_header           Authorization;
    uwsgi_pass_request_headers  on;
    uwsgi_read_timeout          600;
    include                     uwsgi_params;
    client_max_body_size        100m;
}

location ^~/admin {
    limit_req zone=adminlimit;

    uwsgi_pass                  django;
    uwsgi_pass_header           Authorization;
    uwsgi_pass_request_headers  on;
    uwsgi_read_timeout          600;
    include                     uwsgi_params;
    client_max_body_size        100m;
}

include websocket.conf;
`;

  const nginxWebsocketConf = `location /ws {
    proxy_pass http://$(PROJECT_NAME)_${daphneServiceName}:8011;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout      86400;
    proxy_send_timeout      86400;
}
`;

  const nginxErrorsConf = `error_page 500 /500.json;
location /500.json {
    return 500 '{"code":500,"message":"Internal Server Error"}';
}

error_page 502 /502.json;
location /502.json {
    return 502 '{"code":502,"message":"Bad Gateway"}';
}

error_page 503 /503.json;
location /503.json {
    return 503 '{"code":503,"message":"Service Temporarily Unavailable"}';
}

error_page 504 /504.json;
location /504.json {
    return 504 '{"code":504,"message":"Gateway Timeout"}';
}

error_page 400 /400.json;
location /400.json {
    return 400 '{"code":400,"message":"Bad Request"}';
}

error_page 401 /401.json;
location /401.json {
    return 401 '{"code":401,"message":"Unauthorized"}';
}

error_page 403 /403.json;
location /403.json {
    return 403 '{"code":403,"message": "Forbidden"}';
}

error_page 404 /404.json;
location /404.json {
    return 404 '{"code":404,"message":"Not Found"}';
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: migrateServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          'sh -c "python manage.py createcachetable && python manage.py migrate --fake-initial && python manage.py collectstatic --noinput"',
      },
      env: sharedEnv,
      mounts: [
        {
          type: "volume",
          name: "static-content",
          mountPath: "/opt/deploy/intel_owl/static",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: uwsgiServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "sh /opt/deploy/uwsgi-start.sh",
      },
      env: sharedEnv,
      mounts: [
        {
          type: "file",
          content: intelOwlIni,
          mountPath: "/etc/uwsgi/sites/intel_owl.ini",
        },
        {
          type: "file",
          content: uwsgiStartScript,
          mountPath: "/opt/deploy/uwsgi-start.sh",
        },
        {
          type: "volume",
          name: "static-content",
          mountPath: "/opt/deploy/intel_owl/static",
        },
        {
          type: "volume",
          name: "shared-files",
          mountPath: "/opt/deploy/files_required",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: daphneServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "./docker/entrypoints/daphne.sh",
      },
      env: sharedEnv,
      mounts: [
        {
          type: "volume",
          name: "shared-files",
          mountPath: "/opt/deploy/files_required",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: celeryBeatServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "./docker/entrypoints/celery_beat.sh",
      },
      env: sharedEnv,
      mounts: [
        {
          type: "volume",
          name: "shared-files",
          mountPath: "/opt/deploy/files_required",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: celeryWorkerServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "./docker/entrypoints/celery_default.sh",
      },
      env: sharedEnv,
      mounts: [
        {
          type: "volume",
          name: "shared-files",
          mountPath: "/opt/deploy/files_required",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: nginxServiceName,
      source: {
        type: "image",
        image: input.nginxServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: nginxHttpConf,
          mountPath: "/etc/nginx/conf.d/default.conf",
        },
        {
          type: "file",
          content: nginxLocationsConf,
          mountPath: "/etc/nginx/locations.conf",
        },
        {
          type: "file",
          content: nginxWebsocketConf,
          mountPath: "/etc/nginx/websocket.conf",
        },
        {
          type: "file",
          content: nginxErrorsConf,
          mountPath: "/etc/nginx/errors.conf",
        },
        {
          type: "volume",
          name: "static-content",
          mountPath: "/var/www/static",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: dbPassword,
      image: input.dbServiceImage,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: cacheServiceName,
      password: redisPassword,
      image: input.cacheServiceImage,
    },
  });

  return { services };
}
