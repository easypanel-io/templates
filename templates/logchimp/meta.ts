// Generated using "yarn build-templates"

export const meta = {
  name: "LogChimp",
  description: "Build better products with customer feedback.",
  instructions: "null;",
  changeLog: [{ date: "2023-01-28", description: "First Release" }],
  links: [
    { label: "Website", url: "https://logchimp.codecarrot.net/" },
    { label: "Github", url: "https://github.com/logchimp/logchimp" },
    { label: "Documentation", url: "https://logchimp.codecarrot.net/docs/" },
  ],
  contributors: [{ name: "DrMxrcy", url: "https://github.com/DrMxrcy" }],
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
        default: "logchimp",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "tiredofit/logchimp:latest",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "logchimp-db",
      },
    },
  },
  logo: "logo.svg",
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
