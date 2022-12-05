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
    { name: "Ponkhy", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "adminEmail",
      "adminPassword",
      "databaseType",
      "databaseServiceName",
      "redisServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "directus",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "directus/directus:9.18.1",
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
        default: "directus-db",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "directus-redis",
      },
    },
  },
  logo: "logo.png",
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
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
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  adminEmail: AdminEmail;
  adminPassword: AdminPassword;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
  redisServiceName: RedisServiceName;
}
