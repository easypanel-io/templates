// Generated using "yarn build-templates"

export const meta = {
  name: "Jellyfin",
  description:
    "Jellyfin is the volunteer-built media solution that puts you in control of your media. Stream to any device from your own server, with no strings attached. Your media, your server, your way.",
  instructions:
    "Jellyfin takes a few minutes to get ready. Sit back, relax, and get some popcorn!",
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    { label: "Website", url: "https://jellyfin.org/" },
    { label: "Documentation", url: "https://jellyfin.org/docs" },
    { label: "Github", url: "https://github.com/jellyfin/jellyfin" },
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
        default: "jellyfin",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "jellyfin/jellyfin:10.8.5",
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
