// Generated using "yarn build-templates"

export const meta = {
  name: "Sonarr",
  description:
    "Sonarr is a PVR for usenet and bittorrent users. It can monitor multiple RSS feeds for new episodes of your favorite shows and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available.",
  instructions: null,
  changeLog: [{ date: "2022-11-30", description: "first release" }],
  links: [
    { label: "Website", url: "https://sonarr.tv/" },
    { label: "Documentation", url: "https://wiki.servarr.com/sonarr" },
    { label: "Github", url: "https://github.com/Sonarr/Sonarr" },
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
        default: "sonarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/sonarr:latest",
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
