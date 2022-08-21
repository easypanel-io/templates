// Generated using "yarn build-templates"

export const meta = {
  name: "Directus",
  description:
    "Directus is the world's first Open Data Platform for instantly turning any SQL database into an API and beautiful no-code app.Directus Flows are extremely flexible and easy to configure. Using a simple no-code interface, you can connect any number of operations to create simple or complex workflows that execute automatically in response to a trigger.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://directus.io/" },
    { label: "Documentation", url: "https://docs.directus.io/" },
    { label: "Github", url: "https://github.com/directus/docs" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "adminEmail",
      "adminPassword",
      "databaseType",
      "databaseServiceName",
      "redisServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "directus",
      },
      adminEmail: {
        type: "string",
        title: "Admin Email",
        description: "admin@example.com",
      },
      adminPassword: { type: "string", title: "Admin Password" },
      databaseType: {
        type: "string",
        title: "Database Type",
        oneOf: [
          { enum: ["postgres"], title: "Postgres" },
          { enum: ["mysql"], title: "MySQL" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "redis",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
/**
 * admin@example.com
 */
export type AdminEmail = string;
export type AdminPassword = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = Postgres | MySQL;
export type Postgres = "postgres";
export type MySQL = "mysql";
export type DatabaseType2 = string;
export type DatabaseServiceName = string;
export type RedisServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  adminEmail: AdminEmail;
  adminPassword: AdminPassword;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
  redisServiceName: RedisServiceName;
}
