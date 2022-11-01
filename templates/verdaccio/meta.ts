// Generated using "yarn build-templates"

export const meta = {
  name: "Verdaccio",
  description: "A lightweight Node.js private proxy registry",
  instructions: null,
  changeLog: [{ date: "2022-10-31", description: "first release" }],
  links: [
    { label: "Website", url: "https://verdaccio.org/" },
    {
      label: "Documentation",
      url: "https://verdaccio.org/docs/what-is-verdaccio",
    },
    { label: "Github", url: "https://github.com/verdaccio/verdaccio" },
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
        default: "verdaccio",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "verdaccio/verdaccio:5.15",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
