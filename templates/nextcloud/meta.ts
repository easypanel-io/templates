// Generated using "yarn build-templates"

export const meta = {
  name: "Nextcloud",
  description:
    "The self-hosted productivity platform that keeps you in control",
  instructions: null,
  changeLog: [{ date: "2022-07-22", description: "first release" }],
  links: [
    { label: "Website", url: "https://nextcloud.com/" },
    { label: "Documentation", url: "https://docs.nextcloud.com/" },
    { label: "Github", url: "https://github.com/nextcloud" },
  ],
  contributors: [
    { name: "Raul Bedeoan", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "databaseType",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "nextcloud",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "nextcloud:24.0.6",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "sqlite",
        oneOf: [
          { enum: ["sqlite"], title: "SQLite" },
          { enum: ["postgres"], title: "Postgres" },
          { enum: ["mariadb"], title: "MariaDB" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "nextcloud-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = SQLite | Postgres | MariaDB;
export type SQLite = "sqlite";
export type Postgres = "postgres";
export type MariaDB = "mariadb";
export type DatabaseType2 = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
}
