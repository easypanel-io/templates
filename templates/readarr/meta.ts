// Generated using "yarn build-templates"

export const meta = {
  name: "Readarr",
  description:
    "Readarr is a ebook/audiobook collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new books from your favorite authors and will grab, sort and will interface with clients and indexers to grab, sort, and rename them. It can interface with Calibre if you use it to manage your library.",
  instructions: null,
  changeLog: [{ date: "2022-11-30", description: "first release" }],
  links: [
    { label: "Website", url: "https://readarr.com/" },
    { label: "Documentation", url: "https://wiki.servarr.com/en/readarr" },
    { label: "Github", url: "https://github.com/Readarr/Readarr" },
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
        default: "readarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/readarr:develop",
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
