// Generated using "yarn build-templates"

export const meta = {
  name: "Prowlarr",
  description:
    "Prowlarr is a indexer manager/proxy built on the popular arr .net/reactjs base stack to integrate with your various PVR apps. Prowlarr supports both Torrent Trackers and Usenet Indexers. It integrates seamlessly with Sonarr, Radarr, Lidarr, and Readarr offering complete management of your indexers with no per app Indexer setup required (we do it all).",
  instructions: null,
  changeLog: [{ date: "2022-11-30", description: "first release" }],
  links: [
    { label: "Website", url: "https://prowlarr.com/" },
    { label: "Documentation", url: "https://wiki.servarr.com/prowlarr" },
    { label: "Github", url: "https://github.com/Prowlarr/Prowlarr" },
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
        default: "prowlarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/prowlarr:develop",
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
