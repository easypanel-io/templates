import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const dbServiceName = `${input.appServiceName}-db`;
  const backendServiceName = `${input.appServiceName}-backend`;
  const uiServiceName = `${input.appServiceName}-ui`;
  const pictrsServiceName = `${input.appServiceName}-pictrs`;

  const databaseUrl = `postgres://postgres:${dbPassword}@$(PROJECT_NAME)_${dbServiceName}:5432/$(PROJECT_NAME)`;
  const publicDomain = input.publicDomain || "$(EASYPANEL_DOMAIN)";
  const backendHost = `$(PROJECT_NAME)_${backendServiceName}`;
  const uiHost = `$(PROJECT_NAME)_${uiServiceName}`;
  const pictrsHost = `$(PROJECT_NAME)_${pictrsServiceName}`;

  const nginxConfig = `resolver 127.0.0.11 valid=5s;
client_max_body_size 20M;

map $request_method$http_accept $proxpass {
  default "http://${uiHost}:1234";
  "~^(GET|HEAD).*application/(activity|ld)\\+json" "http://${backendHost}:8536";
  "~^(?!GET|HEAD)" "http://${backendHost}:8536";
}

server {
  listen 8080;
  server_name localhost;

  proxy_set_header Host \$host;
  proxy_set_header X-Real-IP \$remote_addr;
  proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto \$scheme;

  location = /.well-known/security.txt {
    proxy_pass http://${uiHost}:1234;
  }

  location ~ ^/(api|pictrs|feeds|nodeinfo|.well-known|version|sitemap.xml) {
    proxy_pass http://${backendHost}:8536;
  }

  location / {
    proxy_pass $proxpass;
  }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "nginx:1.27-alpine",
      },
      domains: [
        {
          host: publicDomain,
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: nginxConfig,
          mountPath: "/etc/nginx/conf.d/default.conf",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: backendServiceName,
      source: {
        type: "image",
        image: input.backendImage,
      },
      mounts: [
        {
          type: "file",
          content: `{
  hostname: ${publicDomain}
  database: {
    uri: "${databaseUrl}"
  }
  pictrs: {
    url: "http://${pictrsHost}:8080/"
  }
}
`,
          mountPath: "/config/config.hjson",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: uiServiceName,
      source: {
        type: "image",
        image: input.uiImage,
      },
      env: [
        `LEMMY_UI_LEMMY_INTERNAL_HOST=${backendHost}:8536`,
        `LEMMY_UI_LEMMY_EXTERNAL_HOST=${publicDomain}`,
        `LEMMY_UI_HTTPS=true`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: pictrsServiceName,
      source: {
        type: "image",
        image: input.pictrsImage,
      },
      env: [`PICTRS__SERVER__API_KEY=${randomPassword()}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/mnt",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "$(PROJECT_NAME)",
      password: dbPassword,
    },
  });

  return { services };
}
