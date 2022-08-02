import {
  AppService,
  createTemplate,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Wordpress",
  meta: {
    description:
      "WordPress powers nearly a third of the world’s websites. With tools for everyone from personal bloggers to large corporations, this powerful site builder and content management system (cms) aims to make it possible for anyone to create an online presence in minutes.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://wordpress.org/" },
      { label: "Documentation", url: "https://learn.wordpress.org" },
      { label: "Github", url: "https://github.com/WordPress/WordPress" },
    ],
    contributors: [
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html",
        },
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
