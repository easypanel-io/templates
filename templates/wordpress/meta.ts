// Generated using "yarn build-templates"

export const meta = {
  name: "Wordpress",
  description:
    "WordPress powers nearly a third of the world’s websites. With tools for everyone from personal bloggers to large corporations, this powerful site builder and content management system (cms) aims to make it possible for anyone to create an online presence in minutes.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://wordpress.org/" },
    { label: "Documentation", url: "https://learn.wordpress.org" },
    { label: "Github", url: "https://github.com/WordPress/WordPress" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "databaseType",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "wordpress",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "mariadb",
        oneOf: [
          { enum: ["mariadb"], title: "MariaDB" },
          { enum: ["mysql"], title: "MySQL" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "wordpress-db",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = MariaDB | MySQL;
export type MariaDB = "mariadb";
export type MySQL = "mysql";
export type DatabaseType2 = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
}
