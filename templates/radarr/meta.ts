// Generated using "yarn build-templates"

export const meta = {
  name: "Radarr",
  description:
    "Radarr is a movie collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new movies and will interface with clients and indexers to grab, sort, and rename them. It can also be configured to automatically upgrade the quality of existing files in the library when a better quality format becomes available. Note that only one type of a given movie is supported.",
  instructions: null,
  changeLog: [{ date: "2022-10-30", description: "first release" }],
  links: [
    { label: "Website", url: "https://radarr.video/" },
    { label: "Documentation", url: "https://wiki.servarr.com/radarr" },
    { label: "Github", url: "https://github.com/Radarr/Radarr" },
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
        default: "radarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/radarr:4.2.4.6635-ls153",
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
