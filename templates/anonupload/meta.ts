// Generated using "yarn build-templates"

export const meta = {
  name: "AnonUpload",
  description: "AnonUpload is a simple, databaseless PHP file uploader.",
  instructions: "visit /admin for the administration interface",
  changeLog: [{ date: "2022-12-22", description: "first release" }],
  links: [
    { label: "Github", url: "https://github.com/supernova3339/anonupload" },
    {
      label: "Enviroment Variables",
      url: "https://github.com/Supernova3339/anonupload/blob/main/env.md",
    },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "domain",
      "appEmail",
      "appPassword",
      "appContactEmail",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "anonupload",
      },
      domain: { type: "string", title: "Domain" },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/supernova3339/anonfiles:1",
      },
      appEmail: { type: "string", title: "Admin Email" },
      appPassword: { type: "string", title: "Admin Password" },
      appContactEmail: { type: "string", title: "App Contact Email" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type AppServiceImage = string;
export type AdminEmail = string;
export type AdminPassword = string;
export type AppContactEmail = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  appServiceImage: AppServiceImage;
  appEmail: AdminEmail;
  appPassword: AdminPassword;
  appContactEmail: AppContactEmail;
}
