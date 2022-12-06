// Generated using "yarn build-templates"

export const meta = {
  name: "Lidarr",
  description:
    "Lidarr is a music collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new tracks from your favorite artists and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available.",
  instructions: null,
  changeLog: [{ date: "2022-12-1", description: "first release" }],
  links: [
    { label: "Website", url: "https://lidarr.audio/" },
    { label: "Documentation", url: "https://wiki.servarr.com/en/lidarr" },
    { label: "Github", url: "https://github.com/lidarr/Lidarr" },
  ],
  contributors: [{ name: "TheH2SO4", url: "https://github.com/TheH2SO4" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "lidarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/lidarr:latest",
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
