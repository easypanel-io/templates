import {
  Services,
  createTemplate,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Miniflux",
  meta: {
    description:
      "Miniflux is a minimalist and opinionated feed reader written in GO.Supports multiple enclosures/attachments (Podcasts, videos, music, and images).Save articles to third-party services.Play videos from YouTube channels directly inside Miniflux.Send articles to Telegram, Pinboard, Instapaper, Pocket, Wallabag, Linkding, Espial, or Nunux Keeper",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://miniflux.app/" },
      { label: "Documentation", url: "https://miniflux.app/docs/" },
      { label: "Github", url: "https://github.com/miniflux" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "adminUsername",
      "adminPassword",
      "appServiceName",
      "databaseServiceName",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      adminUsername: {
        type: "string",
        title: "Admin Username",
      },
      adminPassword: {
        type: "string",
        title: "Admin Password",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "miniflux",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    adminUsername,
    adminPassword,
    appServiceName,
    databaseServiceName
  }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        env: [
          `DATABASE_URL=postgres://postgres:${databasePassword}@${projectName}_${databaseServiceName}/${projectName}?sslmode=disable`,
          `RUN_MIGRATIONS=1`,
          `CREATE_ADMIN=1`,
          `ADMIN_USERNAME=${adminUsername}`,
          `ADMIN_PASSWORD=${adminPassword}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "miniflux/miniflux:latest",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
      }
    });

    services.push({
      type: "postgres",
      data: {
        projectName,
        serviceName: databaseServiceName,
        password: databasePassword,
      },
    });

    return { services };
  },
});
