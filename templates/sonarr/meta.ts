// Generated using "yarn build-templates"

export const meta = {
  name: "Sonarr",
  description:
    "Sonarr is a PVR for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new episodes of your favorite shows and will grab, sort and rename them.",
  instructions: null,
  changeLog: [{ date: "2022-12-26", description: "first release" }],
  links: [
    { label: "Website", url: "https://sonarr.tv/" },
    { label: "Documentation", url: "https://wiki.servarr.com/Sonarr" },
    { label: "Github", url: "https://github.com/Sonarr/Sonarr" },
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
        default: "sonarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/sonarr:version-3.0.9.1549",
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
