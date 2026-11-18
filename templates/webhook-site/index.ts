import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

const NGINX_CONF = `server {
    listen   80;
    server_name  application;

    access_log off;
    error_log /dev/stdout;

    root /var/www/html/public;
    index index.php;

    charset utf-8;

    sendfile off;

    underscores_in_headers on;

    location = favicon.ico { log_not_found off; access_log off; }
    location = robots.txt  { access_log off; log_not_found off; }

    location / {
        try_files $uri /index.php?$query_string;
    }

    location ~ [^/]\\.php(/|$) {
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass            127.0.0.1:9000;
        fastcgi_index           index.php;
        include                 fastcgi_params;
        fastcgi_param           REQUEST_METHOD  $request_method;
        fastcgi_param           SCRIPT_FILENAME $document_root/$fastcgi_script_name;
        fastcgi_param           QUERY_STRING    $query_string;
        fastcgi_param           CONTENT_TYPE    $content_type;
        fastcgi_param           CONTENT_LENGTH  $content_length;
        fastcgi_param           HTTP_PROXY "";
   }

    location ~ /\\.ht {
        deny all;
    }
}
`;

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = `base64:${Buffer.from(randomString(32)).toString("base64")}`;
  const redisPassword = randomPassword();
  const redisHost = `$(PROJECT_NAME)_${input.appServiceName}-redis`;

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
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_ENV=production`,
        `APP_DEBUG=false`,
        `APP_KEY=${appKey}`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
        `APP_LOG=errorlog`,
        `DB_CONNECTION=sqlite`,
        `CACHE_DRIVER=file`,
        `QUEUE_DRIVER=sync`,
        `BROADCAST_DRIVER=redis`,
        `REDIS_HOST=${redisHost}`,
        `REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: NGINX_CONF,
          mountPath: "/etc/nginx/conf.d/nginx.conf",
        },
      ],
    },
  });

  return { services };
}
