// Generated using "yarn build-templates"

export const meta = {
  name: "Oxigen",
  description:
    "Oxigen is a dynamic social media image generator, which gives you an ability to easily create, customize and use og images with both UI and API.",
  instructions: null,
  changeLog: [{ date: "2023-1-22", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/yuriizinets/oxigen" }],
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
        default: "oxigen",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/yuriizinets/oxigen:2.0-rc2",
      },
    },
  },
  logo: "logo.svg",
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
