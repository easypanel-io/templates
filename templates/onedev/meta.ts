// Generated using "npm run build-templates"

export const meta = {
  name: "OneDev",
  description: "OneDev is a self-hosted git server with kanban and CI/CD",
  instructions: null,
  changeLog: [{ date: "2023-02-9", description: "first release" }],
  links: [
    { label: "Website", url: "https://code.onedev.io/" },
    { label: "Documentation", url: "https://docs.onedev.io/" },
    { label: "Github", url: "https://code.onedev.io/onedev/server" },
  ],
  contributors: [{ name: "spaceb0t", url: "https://github.com/spacec0de" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "onedev",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "1dev/server:7.9.12",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "onedev-db",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain?: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
