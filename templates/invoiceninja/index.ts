import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const vhostTemplate = `
server {
    listen 80 default_server;
    server_name _;

    server_tokens off;

    client_max_body_size 100M;

    root /var/www/app/public/;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~* /storage/.*\\.php$ {
        return 503;
    }

    location ~ \\.php$ {
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass \${PHP_FPM_HOST}:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
    }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_ENV=production`,
        `APP_DEBUG=0`,
        `APP_URL=https://$(PROJECT_NAME)-${input.appServiceName}-nginx.$(EASYPANEL_HOST)`,
        `ASSET_URL=https://$(PROJECT_NAME)-${input.appServiceName}-nginx.$(EASYPANEL_HOST)`,
        `APP_KEY=base64:VPtYClO6I4SyH6t79V1fWp9FDrX7WOCK2k+eJbHnTr8=`,
        `DB_TYPE=mysql`,
        `DB_STRICT=false`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mysql`,
        `DB_PASSWORD=${databasePassword}`,
        `QUEUE_CONNECTION=database`,
        `APP_CIPHER=aes-256-cbc`,
        `APP_DEBUG=true`,
        `REQUIRE_HTTPS=false`,
        `PHANTOMJS_PDF_GENERATION=false`,
        `PDF_GENERATOR=snappdf`,
        `TRUSTED_PROXIES='*'`,
        `IN_USER_EMAIL=${input.adminUsername}`,
        `IN_PASSWORD=${input.adminPassword}`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/www/app/storage",
        },
        {
          type: "volume",
          name: "public",
          mountPath: "/var/www/app/public",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-nginx`,
      env: [`PHP_FPM_HOST=$(PROJECT_NAME)_${input.appServiceName}`].join("\n"),
      source: { type: "image", image: input.nginxImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      deploy: {
        command:
          "envsubst '$PHP_FPM_HOST' < /etc/nginx/conf.d/vhost.template > /etc/nginx/conf.d/in-vhost.conf && nginx -g 'daemon off;'",
      },
      mounts: [
        {
          type: "file",
          content: vhostTemplate,
          mountPath: "/etc/nginx/conf.d/vhost.template",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/public/`,
          mountPath: "/var/www/app/public",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      password: databasePassword,
    },
  });

  return { services };
}
