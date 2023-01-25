// Generated using "yarn build-templates"

export const meta = {
  name: "SuiteCRM",
  description:
    "SuiteCRM is a completely open source, enterprise-grade Customer Relationship Management (CRM) application.",
  instructions: null,
  changeLog: [{ date: "2023-1-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://suitecrm.com/" },
    {
      label: "Documentation",
      url: "https://docs.suitecrm.com/",
    },
    { label: "Github", url: "https://github.com/salesagility/SuiteCRM" },
  ],
  contributors: [{ name: "Mxrcy", url: "https://github.com/DrMxrcy" }],
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
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "suitecrm",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "bitnami/suitecrm:8",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "suitecrm-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
