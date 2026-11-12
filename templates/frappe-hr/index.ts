import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const name = input.appServiceName;
  const image = input.appServiceImage;
  const databasePassword = randomPassword();
  const databaseRootPassword = randomPassword();
  const redisPassword = randomPassword();
  const adminPassword = randomPassword();

  const sitesHostPath = `/etc/easypanel/projects/$(PROJECT_NAME)/${name}-sites`;
  const benchPath = "/home/frappe/frappe-bench";
  const sitesMount = {
    type: "bind" as const,
    hostPath: sitesHostPath,
    mountPath: `${benchPath}/sites`,
  };
  const waitForSite = `cd ${benchPath} && until [ -f sites/.site-installed ]; do echo "Waiting for site setup"; sleep 5; done`;

  const backendScript = `set -e
cd ${benchPath}
until [ -w sites ]; do echo "Waiting for sites folder permissions"; sleep 2; done
ls -1 apps > sites/apps.txt
[ -f sites/common_site_config.json ] || echo "{}" > sites/common_site_config.json
bench set-config -g db_host "$DB_HOST"
bench set-config -gp db_port 3306
bench set-config -g redis_cache "$REDIS_URL"
bench set-config -g redis_queue "$REDIS_URL"
bench set-config -g redis_socketio "$REDIS_URL"
bench set-config -gp socketio_port 9000
wait-for-it -t 120 "$DB_HOST:3306"
if [ ! -f sites/.site-installed ]; then
  bench new-site frontend --force --mariadb-user-host-login-scope='%' --db-root-username=root --db-root-password="$DB_ROOT_PASSWORD" --admin-password="$ADMIN_PASSWORD" --install-app erpnext --install-app hrms --set-default
  bench --site frontend enable-scheduler
  touch sites/.site-installed
fi
exec entrypoint.sh start.sh
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-permissions`,
      source: {
        type: "image",
        image: "busybox:1.37",
      },
      deploy: {
        command: `mkdir -p /project/${name}-sites && chown -R 1000:0 /project/${name}-sites && exec sleep 2147483647`,
      },
      mounts: [
        {
          type: "bind",
          hostPath: "/etc/easypanel/projects/$(PROJECT_NAME)",
          mountPath: "/project",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-backend`,
      source: {
        type: "image",
        image,
      },
      env: [
        `DB_HOST=$(PROJECT_NAME)_${name}-db`,
        `DB_ROOT_PASSWORD=${databaseRootPassword}`,
        `ADMIN_PASSWORD=${adminPassword}`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${name}-redis:6379`,
      ].join("\n"),
      deploy: {
        command: "bash /scripts/backend.sh",
      },
      mounts: [
        sitesMount,
        {
          type: "file",
          content: backendScript,
          mountPath: "/scripts/backend.sh",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: name,
      source: {
        type: "image",
        image,
      },
      env: [
        `BACKEND=$(PROJECT_NAME)_${name}-backend:8000`,
        `SOCKETIO=$(PROJECT_NAME)_${name}-websocket:9000`,
        "FRAPPE_SITE_NAME_HEADER=frontend",
        "UPSTREAM_REAL_IP_ADDRESS=0.0.0.0/0",
        "UPSTREAM_REAL_IP_HEADER=X-Forwarded-For",
        "UPSTREAM_REAL_IP_RECURSIVE=off",
        "PROXY_READ_TIMEOUT=120",
        "CLIENT_MAX_BODY_SIZE=50m",
      ].join("\n"),
      deploy: {
        command: `${waitForSite}; exec entrypoint.sh nginx-entrypoint.sh`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [sitesMount],
    },
  });

  const processes = [
    {
      suffix: "websocket",
      command: `node ${benchPath}/apps/frappe/socketio.js`,
    },
    {
      suffix: "worker",
      command: "bench worker --queue long,default,short",
    },
    {
      suffix: "scheduler",
      command: "bench schedule",
    },
  ];

  for (const process of processes) {
    services.push({
      type: "app",
      data: {
        serviceName: `${name}-${process.suffix}`,
        source: {
          type: "image",
          image,
        },
        deploy: {
          command: `${waitForSite}; exec ${process.command}`,
        },
        mounts: [sitesMount],
      },
    });
  }

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${name}-db`,
      image: "mariadb:11.8",
      password: databasePassword,
      rootPassword: databaseRootPassword,
      command:
        "docker-entrypoint.sh mariadbd --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --skip-character-set-client-handshake --innodb-snapshot-isolation=OFF",
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${name}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
