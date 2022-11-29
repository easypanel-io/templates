// Generated using "yarn build-templates"

export const meta = {
  name: "Jirafeau",
  description:
    "Jirafeau is a one-click-filesharing Select your file, upload, share a link. That's it.",
  instructions: null,
  changeLog: [{ date: "2022-11-22", description: "first release" }],
  links: [{ label: "Github", url: "https://gitlab.com/mojo42/Jirafeau" }],
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
        default: "jirafeau",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "jgeusebroek/jirafeau:20221008",
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
