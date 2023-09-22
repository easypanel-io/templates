import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-configurator`,
      env: [
        `REDIS_CACHE: ${input.redisServiceName}-cache:6379`,
        `REDIS_QUEUE: ${input.redisServiceName}-queue:6379`,
        `REDIS_SOCKETIO: ${input.redisServiceName}-socketio:6379`,
        `DB_HOST: ${input.databaseServiceName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `>
ls -1 apps > sites/apps.txt;
bench set-config -g db_host ${input.databaseServiceName};
bench set-config -gp db_port 3306;
bench set-config -g redis_cache "redis://${input.redisServiceName}-cache:6379";
bench set- config - g redis_queue "redis://${input.redisServiceName}-queue:6379";
bench set- config - g redis_socketio "redis://${input.redisServiceName}-socketio:6379";
bench set - config - gp socketio_port 9000;`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-create-site`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `>
wait-for-it -t 120 ${input.databaseServiceName}:3306;
wait-for-it -t 120 ${input.redisServiceName}-cache:6379;
wait-for-it -t 120 ${input.redisServiceName}-queue:6379;
wait-for-it -t 120 ${input.redisServiceName}-socketio:6379;
export start=\`date +% s\`;
until [[ -n \`grep - hs ^ sites / common_site_config.json | jq - r ".db_host // empty"\` ]] && \
  [[ -n \`grep - hs ^ sites / common_site_config.json | jq - r ".redis_cache // empty"\` ]] && \
  [[ -n \`grep - hs ^ sites / common_site_config.json | jq - r ".redis_queue // empty"\` ]];
do
  echo "Waiting for sites/common_site_config.json to be created";
  sleep 5;
  if (( \`date +% s\`-start > 120 )); then
    echo "could not find sites/common_site_config.json with required keys";
    exit 1
  fi
done;
echo "sites/common_site_config.json found";
bench new-site frontend --no-mariadb-socket --admin-password=admin --db-root-password=${input.databasePassword} --install-app erpnext --set-default;`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `BACKEND: ${input.appServiceName}-backend:8000`,
        `FRAPPE_SITE_NAME_HEADER: ${input.projectName}`,
        `SOCKETIO: ${input.appServiceName}-websocket:9000`,
        `UPSTREAM_REAL_IP_ADDRESS: 127.0.0.1`,
        `UPSTREAM_REAL_IP_HEADER: X-Forwarded-For`,
        `UPSTREAM_REAL_IP_RECURSIVE: "off"`,
        `PROXY_READ_TIMEOUT: 120`,
        `CLIENT_MAX_BODY_SIZE: 50m`,
      ].join("\n"),
      deploy: {
        command:
          `>
envsubst '${input.appServiceName}-backend:8000
  ${input.appServiceName}-websocket:9000
  127.0.0.1
  X-Forwarded-For
  "off"
  ${input.projectName}
  120
	50m' \
  </templates/nginx/frappe.conf.template >/etc/nginx/conf.d/frappe.conf

nginx -g 'daemon off;'`,
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
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-backend`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-websocket`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `node /app/apps/frappe/socketio.js`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-scheduler`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `bench scheduler`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-default`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `bench worker --queue default`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-long`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `bench worker --queue long`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-short`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          `bench worker --queue short`,
      },
      mounts: [
        {
          type: "volume",
          name: "sites",
          mountPath: "/app/sites",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: `${input.redisServiceName}-cache`,
      password: redisPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: `${input.redisServiceName}-queue`,
      password: redisPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: `${input.redisServiceName}-socketio`,
      password: redisPassword,
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
