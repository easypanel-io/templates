import { randomBytes } from "crypto";
import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const redisPassword = randomPassword();
  const jwtSecret = randomString(64);
  const appKey = `${randomBytes(32).toString("base64")}`;

  const commonEnv = [
    `APP_NAME=OpnForm`,
    `APP_ENV=production`,
    `APP_KEY=base64:${appKey}`,
    `APP_DEBUG=true`,
    `APP_URL=https://$(PROJECT_NAME)-${input.serviceName}-nginx.$(EASYPANEL_HOST)`,
    `SELF_HOSTED=true`,
    `LOG_CHANNEL=errorlog`,
    `LOG_LEVEL=debug`,
    `FILESYSTEM_DRIVER=local`,
    `LOCAL_FILESYSTEM_VISIBILITY=public`,
    `BROADCAST_CONNECTION=log`,
    `CACHE_STORE=redis`,
    `CACHE_DRIVER=redis`,
    `QUEUE_CONNECTION=redis`,
    `SESSION_DRIVER=redis`,
    `SESSION_LIFETIME=120`,
    `MAIL_MAILER=log`,
    `MAIL_HOST=null`,
    `MAIL_PORT=null`,
    `MAIL_USERNAME=your@email.com`,
    `MAIL_PASSWORD=null`,
    `MAIL_ENCRYPTION=null`,
    `MAIL_FROM_ADDRESS=your@email.com`,
    `MAIL_FROM_NAME=OpnForm`,
    `AWS_ACCESS_KEY_ID=null`,
    `AWS_SECRET_ACCESS_KEY=null`,
    `AWS_DEFAULT_REGION=us-east-1`,
    `AWS_BUCKET=null`,
    `JWT_TTL=1440`,
    `JWT_SECRET=${jwtSecret}`,
    `JWT_SKIP_IP_UA_VALIDATION=true`,
    `OPEN_AI_API_KEY=null`,
    `H_CAPTCHA_SITE_KEY=null`,
    `H_CAPTCHA_SECRET_KEY=null`,
    `RE_CAPTCHA_SITE_KEY=null`,
    `RE_CAPTCHA_SECRET_KEY=null`,
    `TELEGRAM_BOT_ID=null`,
    `TELEGRAM_BOT_TOKEN=null`,
    `SHOW_OFFICIAL_TEMPLATES=true`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.serviceName}-redis:6379`,
    `DB_HOST=$(PROJECT_NAME)_${input.serviceName}-db`,
    `DB_DATABASE=$(PROJECT_NAME)`,
    `DB_USERNAME=postgres`,
    `DB_PASSWORD=${postgresPassword}`,
    `DB_CONNECTION=pgsql`,
    `PHP_MEMORY_LIMIT=1G`,
    `PHP_MAX_EXECUTION_TIME=600`,
    `PHP_UPLOAD_MAX_FILESIZE=64M`,
    `PHP_POST_MAX_SIZE=64M`,
  ].join("\n");

  const nginxConfig = `
map $request_uri $api_uri {
    ~^/api(/.*$) $1;
    default $request_uri;
}

server {
    listen 80 default_server;
    root /usr/share/nginx/html/public;

    access_log /dev/stdout;
    error_log /dev/stderr error;

    index index.html index.htm index.php;

    location / {
        proxy_http_version 1.1;
        proxy_pass http://\${OPNFORM_UI_HOST}:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    location ~/(api|open|local\\/temp|forms\\/assets)/ {
        set $original_uri $uri;
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \\.php$ {
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass \${OPNFORM_API_HOST}:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_param REQUEST_URI $api_uri;
    }

    # Deny access to . files
    location ~ /\\. {
        deny all;
    }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-nginx`,
      env: [
        `OPNFORM_API_HOST=$(PROJECT_NAME)_${input.serviceName}-api`,
        `OPNFORM_UI_HOST=$(PROJECT_NAME)_${input.serviceName}-ui`,
      ].join("\n"),
      source: {
        type: "image",
        image: "nginx:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      deploy: {
        command:
          "envsubst '${OPNFORM_API_HOST} ${OPNFORM_UI_HOST}' < /etc/nginx/conf.d/opnform.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'",
      },
      mounts: [
        {
          type: "file",
          content: nginxConfig,
          mountPath: "/etc/nginx/conf.d/opnform.template",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-ui`,
      env: [
        `NUXT_PUBLIC_APP_URL=/`,
        `NUXT_PUBLIC_API_BASE=/api`,
        `NUXT_PRIVATE_API_BASE=http://$(PROJECT_NAME)_${input.serviceName}-nginx/api`,
        `NUXT_PUBLIC_ENV=production`,
        `NUXT_PUBLIC_H_CAPTCHA_SITE_KEY=null`,
        `NUXT_PUBLIC_RE_CAPTCHA_SITE_KEY=null`,
        `NUXT_PUBLIC_ROOT_REDIRECT_URL=null`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-api`,
      env: [commonEnv].join("\n"),
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "api-storage",
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-worker`,
      env: [commonEnv].join("\n"),
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.serviceName}-api/volumes/api-storage/`,
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
      deploy: {
        command: "php artisan queue:work",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.serviceName}-scheduler`,
      env: [commonEnv].join("\n"),
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.serviceName}-api/volumes/api-storage/`,
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
      deploy: {
        command: "php artisan schedule:work",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.serviceName}-db`,
      password: postgresPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.serviceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
