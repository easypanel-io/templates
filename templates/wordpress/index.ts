import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();
  const redisPassword = randomPassword();

  const appEnv = [
    `WORDPRESS_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
    `WORDPRESS_DB_USER=${input.databaseType}`,
    `WORDPRESS_DB_PASSWORD=${mysqlPassword}`,
    `WORDPRESS_DB_NAME=${input.projectName}`,
  ];

  const fpm = input.appServiceImage.includes("fpm");
  const appPort = fpm ? 9000 : 80;
  const exec = fpm ? "php-fpm" : "apache2-foreground";
  const alpine = input.appServiceImage.includes("alpine")
    ? "apk add $PHPIZE_DEPS && "
    : "";
  const cmd =
    alpine +
    "pecl install redis && docker-php-ext-enable redis && docker-entrypoint.sh " +
    exec;

  if (input.redisService) {
    services.push({
      type: "redis",
      data: {
        projectName: input.projectName,
        serviceName: input.redisServiceName,
        password: redisPassword,
      },
    });
    appEnv.push(
      `WORDPRESS_CONFIG_EXTRA=define('WP_REDIS_HOST', '${input.projectName}_${input.redisServiceName}'); define('WP_REDIS_PASSWORD', '${redisPassword}'); $redis_server = array( 'host' => '${input.projectName}_${input.redisServiceName}', 'port' => 6379, 'auth' => '${redisPassword}', 'database' => 0 );`
    );
  }

  services.push({
    type: input.databaseType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mysqlPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: appPort, secure: true },
      mounts: [
        { type: "volume", name: "data", mountPath: "/var/www/html" },
        {
          type: "file",
          content: [
            "upload_max_filesize = 100M",
            "post_max_size = 100M",
            "",
          ].join("\n"),
          mountPath: "/usr/local/etc/php/conf.d/custom.ini",
        },
      ],
      deploy: input.redisService ? { command: cmd } : {},
    },
  });

  return { services };
}
