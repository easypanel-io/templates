import {
  AppService,
  createTemplate,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Wordpress",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "mysqlServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "web",
      },
      mysqlServiceName: {
        type: "string",
        title: "MySQL Service Name",
        default: "db",
      },
      mysqlPassword: {
        type: "string",
        title: "MySQL Password",
        description: "Leave empty to generate a random one.",
      },
      mysqlRootPassword: {
        type: "string",
        title: "MySQL Root Password",
        description: "Leave empty to generate a random one.",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    mysqlServiceName,
    mysqlPassword = randomPassword(),
    mysqlRootPassword = randomPassword(),
  }) {
    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `WORDPRESS_DB_HOST=${projectName}_${mysqlServiceName}`,
        `WORDPRESS_DB_USER=mysql`,
        `WORDPRESS_DB_PASSWORD=${mysqlPassword}`,
        `WORDPRESS_DB_NAME=${projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "wordpress",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "wp-content",
          target: "/var/www/html/wp-content",
        },
      ],
    };

    const mysqlService: MySQLService = {
      projectName,
      serviceName: mysqlServiceName,
      password: mysqlPassword,
      rootPassword: mysqlRootPassword,
    };

    return {
      services: [
        { type: "app", data: appService },
        { type: "mysql", data: mysqlService },
      ],
    };
  },
});
