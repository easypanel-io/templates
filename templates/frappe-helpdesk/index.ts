import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseRootPassword = randomPassword();
  const redisPassword = randomPassword();

  const initScript = `#!bin/bash

if [ -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo "Bench already exists, skipping init"
    cd frappe-bench
    bench start
else
    echo "Creating new bench..."
fi

bench init --skip-redis-config-generation frappe-bench --version version-15

cd frappe-bench

# Use containers instead of localhost
bench set-mariadb-host $(PROJECT_NAME)_${input.appServiceName}-mariadb
bench set-redis-cache-host redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379
bench set-redis-queue-host redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379
bench set-redis-socketio-host redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379

# Remove redis, watch from Procfile
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

bench get-app telephony --branch main
bench get-app helpdesk --branch main

bench new-site helpdesk.localhost \
--force \
--mariadb-root-password ${databaseRootPassword} \
--admin-password admin \
--no-mariadb-socket

bench --site helpdesk.localhost install-app telephony
bench --site helpdesk.localhost install-app helpdesk
bench --site helpdesk.localhost set-config developer_mode 1
bench --site helpdesk.localhost set-config mute_emails 1
bench --site helpdesk.localhost set-config server_script_enabled 1
bench --site helpdesk.localhost clear-cache
bench use helpdesk.localhost

bench start`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`SHELL=/bin/bash`].join("\n"),
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
          name: "workspace",
          mountPath: "/workspace",
        },
        {
          type: "file",
          content: initScript,
          mountPath: "/workspace/init.sh",
        },
      ],
      deploy: {
        command: "bash /workspace/init.sh",
      },
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-mariadb`,
      rootPassword: databaseRootPassword,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
