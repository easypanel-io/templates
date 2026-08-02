import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariadbRootPassword = randomPassword();
  const mariadbPassword = randomPassword();
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

# Remove redis and watch from Procfile because EasyPanel runs Redis separately.
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

bench get-app erpnext --branch version-15

bench new-site erpnext.localhost \\
--force \\
--mariadb-root-password ${mariadbRootPassword} \\
--admin-password admin \\
--no-mariadb-socket

bench --site erpnext.localhost install-app erpnext
bench --site erpnext.localhost set-config developer_mode 1
bench --site erpnext.localhost set-config mute_emails 1
bench --site erpnext.localhost clear-cache
bench use erpnext.localhost

bench start
  `;

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-mariadb`,
      rootPassword: mariadbRootPassword,
      password: mariadbPassword,
    },
  });

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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: ["SHELL=/bin/bash"].join("\n"),
      mounts: [
        {
          type: "file",
          content: initScript,
          mountPath: "/workspace/init.sh",
        },
        {
          type: "volume",
          name: "workspace",
          mountPath: "/workspace",
        },
      ],
      deploy: {
        command: "bash /workspace/init.sh",
      },
    },
  });

  return { services };
}
