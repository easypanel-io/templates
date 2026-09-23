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
  const secretKey = randomString(32);
  const adminPassword = randomPassword();

  const dbServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;
  const apiServiceName = `${input.appServiceName}-api`;
  const eventsServiceName = `${input.appServiceName}-events`;
  const workerServiceName = `${input.appServiceName}-worker`;

  const zouDockerfile = `FROM python:3.11.16-slim-bookworm
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
      build-essential ffmpeg git libjpeg-dev libpq-dev xmlsec1 \\
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir zou==${input.zouVersion}
RUN mkdir -p /opt/zou/previews
WORKDIR /opt/zou
EXPOSE 5000 5001
`;

  const domainName =
    input.publicDomain || `$(PROJECT_NAME)-${input.appServiceName}.local`;

  const sharedEnv = [
    `DB_DRIVER=postgresql+psycopg`,
    `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
    `DB_PORT=5432`,
    `DB_USERNAME=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `DB_DATABASE=zoudb`,
    `KV_HOST=$(PROJECT_NAME)_${redisServiceName}`,
    `KV_PORT=6379`,
    `KV_PASSWORD=${redisPassword}`,
    `SECRET_KEY=${secretKey}`,
    `DOMAIN_PROTOCOL=https`,
    `DOMAIN_NAME=${domainName}`,
    `PREVIEW_FOLDER=/opt/zou/previews`,
    `ENABLE_JOB_QUEUE=${input.enableJobQueue ? "true" : "false"}`,
    `ZOU_ADMIN_EMAIL=${input.adminEmail}`,
    `ZOU_ADMIN_PASSWORD=${adminPassword}`,
  ];

  if (input.smtpHost) {
    sharedEnv.push(`MAIL_ENABLED=true`);
    sharedEnv.push(`MAIL_SERVER=${input.smtpHost}`);
    sharedEnv.push(`MAIL_PORT=${input.smtpPort}`);
    if (input.smtpUsername) {
      sharedEnv.push(`MAIL_USERNAME=${input.smtpUsername}`);
    }
    if (input.smtpPassword) {
      sharedEnv.push(`MAIL_PASSWORD=${input.smtpPassword}`);
    }
    sharedEnv.push(`MAIL_USE_TLS=true`);
    sharedEnv.push(
      `MAIL_DEFAULT_SENDER=${input.smtpSender || input.adminEmail}`
    );
  } else {
    sharedEnv.push(`MAIL_ENABLED=false`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: apiServiceName,
      source: {
        type: "dockerfile",
        dockerfile: zouDockerfile,
      },
      env: sharedEnv.join("\n"),
      deploy: {
        command: `zou upgrade-db --no-telemetry; test -f /opt/zou/previews/.zou-initialized || (zou init-data --domain ${input.studioDomain} && zou create-admin "${input.adminEmail}" --password "${adminPassword}" && touch /opt/zou/previews/.zou-initialized); exec gunicorn -w 3 -k gevent -b 0.0.0.0:5000 --timeout 600 zou.app:app`,
      },
      mounts: [
        {
          type: "volume",
          name: "previews",
          mountPath: "/opt/zou/previews",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: eventsServiceName,
      source: {
        type: "dockerfile",
        dockerfile: zouDockerfile,
      },
      env: sharedEnv.join("\n"),
      deploy: {
        command:
          "exec gunicorn -w 1 -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -b 0.0.0.0:5001 zou.event_stream:app",
      },
    },
  });

  if (input.enableJobQueue) {
    services.push({
      type: "app",
      data: {
        serviceName: workerServiceName,
        source: {
          type: "dockerfile",
          dockerfile: zouDockerfile,
        },
        env: sharedEnv.join("\n"),
        deploy: {
          command: "exec rq worker -c zou.job_settings",
        },
        mounts: [
          {
            type: "bind",
            hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${apiServiceName}/volumes/previews`,
            mountPath: "/opt/zou/previews",
          },
        ],
      },
    });
  }

  const nginxConf = `server {
    listen 80;
    server_name _;

    location /api {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_pass http://$(PROJECT_NAME)_${apiServiceName}:5000/;
        client_max_body_size 1G;
    }

    location /socket.io {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass http://$(PROJECT_NAME)_${eventsServiceName}:5001;
    }

    location / {
        root /opt/zou/kitsu;
        try_files $uri $uri/ /index.html;
    }
}
`;

  const frontendDockerfile = `FROM nginx:1.27.5-alpine
RUN apk add --no-cache curl && \\
    mkdir -p /opt/zou/kitsu && \\
    curl -fsSL -o /tmp/kitsu.tgz https://github.com/cgwire/kitsu/releases/download/v${input.kitsuVersion}/kitsu-${input.kitsuVersion}.tgz && \\
    tar xzf /tmp/kitsu.tgz -C /opt/zou/kitsu && \\
    rm /tmp/kitsu.tgz && \\
    rm -f /etc/nginx/conf.d/default.conf
EXPOSE 80
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "dockerfile",
        dockerfile: frontendDockerfile,
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
          content: nginxConf,
          mountPath: "/etc/nginx/conf.d/default.conf",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "zoudb",
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
