// Generated using "yarn build-templates"

export const meta = {
  name: "SimpleTorrent",
  description: "https://github.com/boypt/simple-torrent/wiki",
  instructions: null,
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/boypt/simple-torrent/wiki",
    },
    { label: "Github", url: "https://github.com/boypt/simple-torrent" },
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
        default: "simpletorrent",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "boypt/cloud-torrent:1.3.9",
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
