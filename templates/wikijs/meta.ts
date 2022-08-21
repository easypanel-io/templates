// Generated using "yarn build-templates"

export const meta = {
  name: "Wiki.js",
  description:
    "Extensible open source Wiki software.Make documentation a joy to write using Wiki.js's beautiful and intuitive interface! Works on virtually any platform and is compatible with either PostgreSQL, MySQL, MariaDB, MS SQL Server or SQLite! Running on the blazing fast Node.js engine, Wiki.js is built with performance in mind.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://js.wiki/" },
    { label: "Documentation", url: "https://docs.requarks.io/" },
    { label: "Github", url: "https://github.com/Requarks/wiki" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "databaseType",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "wikijs",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "postgres",
        oneOf: [
          { enum: ["postgres"], title: "Postgres" },
          { enum: ["mysql"], title: "MySQL" },
          { enum: ["mariadb"], title: "MariaDB" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = Postgres | MySQL | MariaDB;
export type Postgres = "postgres";
export type MySQL = "mysql";
export type MariaDB = "mariadb";
export type DatabaseType2 = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
}
