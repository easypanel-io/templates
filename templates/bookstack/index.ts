import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Bookstack",
  meta: {
    description:
      "BookStack is a simple, self-hosted, easy-to-use platform for organising and storing information.The content in BookStack is fully searchable. You are able to search at book level or across all books, chapters & pages.BookStack is built using PHP, on top of the Laravel framework and it uses MySQL to store data.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://www.bookstackapp.com/" },
      { label: "Documentation", url: "https://www.bookstackapp.com/docs/" },
      { label: "Github", url: "https://github.com/BookStackApp/BookStack" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain", "databaseServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "bookstack",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain, databaseServiceName }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        env: [
          `APP_URL=https://${domain}`,
          `DB_HOST=${projectName}_${databaseServiceName}`,
          `DB_USER=mysql`,
          `DB_PASS=${databasePassword}`,
          `DB_DATABASE=${projectName}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "lscr.io/linuxserver/bookstack",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        mounts: [
          {
            type: "volume",
            name: "config",
            mountPath: "/config",
          },
        ],
      },
    });

    services.push({
      type: "mysql",
      data: {
        projectName,
        serviceName: databaseServiceName,
        image: "mariadb:latest",
        password: databasePassword,
      },
    });

    return { services };
  },
});
