// Generated using "yarn build-templates"

export const meta = {
  name: "Matomo",
  description:
    "Google Analytics alternative that protects your data and your customers' privacy. Take back control with Matomo – a powerful web analytics platform that gives you 100% data ownership.",
  instructions: null,
  changeLog: [{ date: "2022-09-28", description: "first release" }],
  links: [
    { label: "Website", url: "https://matomo.org/" },
    {
      label: "Documentation",
      url: "https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/",
    },
    { label: "Github", url: "https://github.com/matomo-org/matomo" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "domain",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "matomo",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "matomo-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  databaseServiceName: DatabaseServiceName;
}
