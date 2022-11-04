// Generated using "yarn build-templates"

export const meta = {
  name: "Flarum",
  description:
    "Flarum is the next-generation forum software that makes online discussion fun. It's simple, fast, and free.",
  instructions: "Please use the credentials flarum:flarum to login.",
  changeLog: [{ date: "2022-10-31", description: "first release" }],
  links: [
    { label: "Website", url: "https://flarum.org/" },
    { label: "Documentation", url: "https://docs.flarum.org/" },
    { label: "Github", url: "https://github.com/flarum/flarum" },
  ],
  contributors: [
    { name: "Rubén Robles", url: "https://github.com/D8vjork" },
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "appDomain",
      "databaseType",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "flarum",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "crazymax/flarum:1.5.0",
      },
      appDomain: { type: "string", title: "App Domain" },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "mariadb",
        oneOf: [
          { enum: ["mysql"], title: "MySQL" },
          { enum: ["mariadb"], title: "MariaDB" },
          { enum: ["external"], title: "External" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name (URL if external)",
        default: "flarum-db",
      },
      databasePort: {
        type: "string",
        title: "Database Port (blank to default)",
      },
      databaseName: {
        type: "string",
        title: "Database Name (blank to default)",
      },
      databaseUser: {
        type: "string",
        title: "Database User (blank to default)",
      },
      databaseUserPassword: {
        type: "string",
        title: "Database User Password (blank to randomly generated)",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type AppDomain = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = MySQL | MariaDB | External;
export type MySQL = "mysql";
export type MariaDB = "mariadb";
export type External = "external";
export type DatabaseType2 = string;
export type DatabaseServiceNameURLIfExternal = string;
export type DatabasePortBlankToDefault = string;
export type DatabaseNameBlankToDefault = string;
export type DatabaseUserBlankToDefault = string;
export type DatabaseUserPasswordBlankToRandomlyGenerated = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  appDomain: AppDomain;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceNameURLIfExternal;
  databasePort?: DatabasePortBlankToDefault;
  databaseName?: DatabaseNameBlankToDefault;
  databaseUser?: DatabaseUserBlankToDefault;
  databaseUserPassword?: DatabaseUserPasswordBlankToRandomlyGenerated;
}
