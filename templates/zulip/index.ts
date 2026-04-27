import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const rabbitmqPassword = randomPassword();
  const redisPassword = randomPassword();
  const secretKey = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "zulip/zulip-postgresql:14",
      password: postgresPassword,
      user: "zulip",
      databaseName: "zulip",
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
      serviceName: `${input.appServiceName}-memcached`,
      source: {
        type: "image",
        image: "memcached:alpine",
      },
      deploy: {
        command: "memcached -m 64 -p 11211 -u memcache -l 0.0.0.0",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: "rabbitmq:4.0.7",
      },
      env: [
        "RABBITMQ_DEFAULT_USER=zulip",
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "rabbitmq-data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
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
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        "DB_HOST_PORT=5432",
        "DB_USER=zulip",
        `SETTING_MEMCACHED_LOCATION=$(PROJECT_NAME)_${input.appServiceName}-memcached:11211`,
        `SETTING_RABBITMQ_HOST=$(PROJECT_NAME)_${input.appServiceName}-rabbitmq`,
        `SETTING_REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `SECRETS_postgres_password=${postgresPassword}`,
        `SECRETS_postgres_user=postgres`,
        `SECRETS_postgres_db=$(PROJECT_NAME)`,
        `SECRETS_rabbitmq_password=${rabbitmqPassword}`,
        `SECRETS_redis_password=${redisPassword}`,
        `SECRETS_secret_key=${secretKey}`,
        "SETTING_EXTERNAL_HOST=$(PRIMARY_DOMAIN)",
        `SETTING_ZULIP_ADMINISTRATOR=${input.adminEmail}`,
        `SETTING_EMAIL_HOST=${input.emailHost || ""}`,
        `SETTING_EMAIL_HOST_USER=${input.emailHostUser || ""}`,
        `SETTING_EMAIL_PORT=${input.emailPort || "587"}`,
        "SETTING_EMAIL_USE_SSL=False",
        "SETTING_EMAIL_USE_TLS=True",
        "DISABLE_HTTPS=True",
        "SSL_CERTIFICATE_GENERATION=self-signed",
        "LOADBALANCER_IPS=172.16.0.0/12,10.0.0.0/8,192.168.0.0/16",
        "ZULIP_AUTH_BACKENDS=EmailAuthBackend",
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "zulip-data",
          mountPath: "/data",
        },
      ],
      scripts: [
        {
          name: "Generate Realm Creation Link",
          script: [
            "su -s /bin/bash zulip -c 'cd /home/zulip/deployments/current && ./manage.py generate_realm_creation_link'",
          ].join("\n"),
        },
      ],
    },
  });

  return { services };
}
