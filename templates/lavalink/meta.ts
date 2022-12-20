// Generated using "yarn build-templates"

export const meta = {
  name: "Lavalink",
  description: "Standalone audio sending node based on Lavaplayer.",
  instructions: null,
  changeLog: [{ date: "2019-07-24", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/freyacodes/Lavalink/blob/master/README.md",
    },
    { label: "Github", url: "https://github.com/freyacodes/Lavalink" },
  ],
  contributors: [{ name: "kaname-png", url: "https://github.com/kaname-png" }],
  schema: {
    type: "object",
    required: ["projectName", "password", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      password: { type: "string", title: "Server connection password" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "lavalink-server",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "fredboat/lavalink:v3.7",
      },
    },
  },
  logo: "logo.png",
  screenshots: [],
};

export type ProjectName = string;
export type ServerConnectionPassword = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  password: ServerConnectionPassword;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
