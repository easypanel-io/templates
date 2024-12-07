import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appKey = Buffer.from(randomString(32)).toString("base64");
  const databasePassword = randomPassword();
  const jwtSecret = randomString(40);
  const sharedSecret = randomString(40);

  const apiEnvironment = [
    `APP_NAME=OpnForm`,
    `APP_ENV=production`,
    `APP_KEY=base64:${appKey}`,
    `APP_DEBUG=false`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
    `DB_DATABASE=$(PROJECT_NAME)`,
    `DB_USERNAME=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `DB_CONNECTION=pgsql`,
    `FILESYSTEM_DISK=local`,
    `LOCAL_FILESYSTEM_VISIBILITY=public`,
    `JWT_SECRET=${jwtSecret}`,
    `FRONT_API_SECRET=${sharedSecret}`,
  ].join("\n");

  const vhostTemplate = `
server {
    listen 80;
    server_name _;

    access_log /dev/stdout;
    error_log  /dev/stderr error;

    location / {
        proxy_pass http://\${UI_HOST}:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    location ~/(api|open|local\\/temp|forms\\/assets)/ {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass \${API_HOST}:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /usr/share/nginx/html/public/index.php;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.apiServiceName,
      env: apiEnvironment,
      source: {
        type: "image",
        image: "jhumanj/opnform-api:1.4.5",
      },
      mounts: [
        {
          type: "volume",
          name: "opnform-storage",
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.uiServiceName,
      env: [
        `NUXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `NUXT_PUBLIC_API_BASE=https://$(PRIMARY_DOMAIN)/api`,
        `NUXT_API_SECRET=${sharedSecret}`,
        `NUXT_PUBLIC_ENV=dev`,
      ].join("\n"),
      source: {
        type: "image",
        image: "jhumanj/opnform-client:1.4.5",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.ingressServiceName,
      env: [
        `UI_HOST=$(PROJECT_NAME)_${input.uiServiceName}`,
        `API_HOST=$(PROJECT_NAME)_${input.apiServiceName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "nginx:1.25",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      deploy: {
        command:
          "envsubst '$UI_HOST $API_HOST' < /etc/nginx/conf.d/vhost.template > /etc/nginx/conf.d/default.conf && nginx -g \"daemon off;\"",
      },
      mounts: [
        {
          type: "file",
          content: vhostTemplate,
          mountPath: "/etc/nginx/conf.d/vhost.template",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.workerServiceName,
      env: apiEnvironment + "\nIS_API_WORKER=true",
      source: {
        type: "image",
        image: "jhumanj/opnform-api:1.4.5",
      },
      mounts: [
        {
          type: "volume",
          name: "opnform-storage",
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
