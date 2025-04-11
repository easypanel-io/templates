import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const commonEnvs = [
    `TZ=Europe/Paris`,
    `PUID=1000`,
    `PGID=1000`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_USER=mariadb`,
    `DB_PASSWORD=${databasePassword}`,
    "DB_TIMEOUT=60",
  ];

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
      env: [
        ...commonEnvs,
        `MEMORY_LIMIT=256M`,
        `MAX_INPUT_VARS=1000`,
        `UPLOAD_MAX_SIZE=16M`,
        `OPCACHE_MEM_SIZE=128M`,
        `REAL_IP_FROM=0.0.0.0/32`,
        `REAL_IP_HEADER=X-Forwarded-For`,
        `LOG_IP_VAR=remote_addr`,
        `CACHE_DRIVER=redis`,
        `SESSION_DRIVER=redis`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PASSWORD=${redisPassword}`,
        `LIBRENMS_SNMP_COMMUNITY=public`,
        `LIBRENMS_WEATHERMAP=false`,
        `LIBRENMS_WEATHERMAP_SCHEDULE=*/5 * * * *`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "librenms",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-dispatcher`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        ...commonEnvs,
        "DISPATCHER_NODE_ID=dispatcher1",
        "SIDECAR_DISPATCHER=1",
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/librenms/`,
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-syslogng`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      ports: [
        {
          published: 514,
          target: 514,
          protocol: "tcp",
        },
        {
          published: 514,
          target: 514,
          protocol: "udp",
        },
      ],
      env: [...commonEnvs, "SIDECAR_SYSLOGNG=1"].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/librenms/`,
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-snmptrapd`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      ports: [
        {
          published: 162,
          target: 162,
          protocol: "tcp",
        },
        {
          published: 162,
          target: 162,
          protocol: "udp",
        },
      ],
      env: [...commonEnvs, "SIDECAR_SNMPTRAPD=1"].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/librenms/`,
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-msmtpd`,
      source: {
        type: "image",
        image: "crazymax/msmtpd:latest",
      },
    },
  });

  return { services };
}
