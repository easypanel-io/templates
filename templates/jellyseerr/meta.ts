// Generated using "yarn build-templates"

export const meta = {
  name: "Jellyseerr",
  description:
    "Jellyseerr is a free and open source software application for managing requests for your media library. It is a a fork of Overseerr built to bring support for Jellyfin & Emby media servers!",
  instructions: "none",
  changeLog: [{ date: "2022-12-20", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/Fallenbagel/jellyseerr/tree/develop/docs",
    },
    { label: "Github", url: "https://github.com/Fallenbagel/jellyseerr" },
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
        default: "jellyseerr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "fallenbagel/jellyseerr:1.2.1",
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
