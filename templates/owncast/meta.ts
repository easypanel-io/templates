// Generated using "yarn build-templates"

export const meta = {
  name: "Owncast",
  description: "A lightweight Node.js private proxy registry",
  instructions: null,
  changeLog: [{ date: "2023-2-21", description: "first release" }],
  links: [
    { label: "Website", url: "https://owncast.online/" },
    { label: "Documentation", url: "https://owncast.online/docs" },
    { label: "Github", url: "https://github.com/owncast/owncast" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "owncast",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "gabekangas/owncast:0.0.13",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
