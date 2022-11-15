// Generated using "yarn build-templates"

export const meta = {
  name: "Freshrss",
  description: "Freshrss is a free, self-hostable aggregator for rss feeds.",
  instructions: null,
  changeLog: [{ date: "2022-11-14", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://docs.linuxserver.io/images/docker-freshrss",
    },
    { label: "Github", url: "https://github.com/linuxserver/docker-freshrss" },
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
        default: "freshrss",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lscr.io/linuxserver/freshrss:latest",
      },
    },
  },
  logo: "logo.svg",
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
