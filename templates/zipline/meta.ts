// Generated using "yarn build-templates"

export const meta = {
  name: "Zipline",
  description:
    "A ShareX/file upload server that is easy to use, packed with features, and with an easy setup!",
  instructions: `After installing Zipline for the first time, you may login to the dashboard with the username "administrator" and the password "password".`,
  changeLog: [{ date: "2023-01-20", description: "First Release" }],
  links: [
    { label: "Website", url: "https://zipline.diced.tech/" },
    { label: "Github", url: "https://github.com/diced/zipline" },
    {
      label: "Documentation",
      url: "https://zipline.diced.tech/docs/get-started",
    },
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
        default: "zipline",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/diced/zipline:3.6.4",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "zipline-db",
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
