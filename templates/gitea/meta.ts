// Generated using "yarn build-templates"

export const meta = {
  name: "Gitea",
  description:
    "Gitea is a community managed lightweight code hosting solution written in Go. Gitea runs anywhere Go can compile for: Windows, macOS, Linux, ARM, etc.Gitea has low minimal requirements and can run on an inexpensive Raspberry Pi",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://gitea.io/en-us/" },
    { label: "Documentation", url: "https://docs.gitea.io/en-us/" },
    { label: "Github", url: "https://github.com/go-gitea/" },
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
      "databaseType",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "gitea",
      },
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
        default: "gitea-db",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = Postgres | MySQL;
export type Postgres = "postgres";
export type MySQL = "mysql";
export type DatabaseType2 = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  databaseType: DatabaseType;
  databaseServiceName: DatabaseServiceName;
}
