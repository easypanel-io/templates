// Generated using "yarn build-templates"

export const meta = {
  name: "Lenpaste",
  description: "https://github.com/boypt/simple-torrent/wiki",
  instructions: null,
  changeLog: [
  	{ date: "2023-1-28", description: "update to v1.3" },
  	{ date: "2022-12-20", description: "first release" },
  ],
  links: [
    {
      label: "Documentation",
      url: "https://git.lcomrade.su/root/lenpaste/src/branch/main/docs",
    },
    { label: "Gitea", url: "https://git.lcomrade.su/root/lenpaste" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
    { name: "Leonid Maslakov", url: "https://lcomrade.su" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "lenpaste",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "git.lcomrade.su/root/lenpaste:1.3",
      },
    },
  },
  logo: null,
  screenshots: ["screenshot1.png", "screenshot2.png", "screenshot3.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
