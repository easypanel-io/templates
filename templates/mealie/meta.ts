// Generated using "yarn build-templates"

export const meta = {
  name: "Mealie",
  description:
    "Mealie is a self hosted recipe manager and meal planner with a RestAPI backend and a reactive frontend application built in Vue for a pleasant user experience for the whole family.",
  instructions:
    "Please use the following credentials to login. changeme@easypanel.io|MyPassword",
  changeLog: [{ date: "2022-12-11", description: "first release" }],
  links: [
    { label: "Documentation", url: "https://nightly.mealie.io/" },
    { label: "Github", url: "https://github.com/hay-kot/mealie/" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "mealie",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "hkotel/mealie:v0.5.6",
      },
    },
  },
  logo: "logo.png",
  screenshots: [
    "screenshot1.png",
    "screenshot2.png",
    "screenshot3.png",
    "screenshot4.png",
    "screenshot5.png",
  ],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
