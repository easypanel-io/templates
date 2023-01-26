// Generated using "yarn build-templates"

export const meta = {
  name: "Tautuilli",
  description:
    "Tautulli is a 3rd party application that you can run alongside your Plex Media Server to monitor activity and track various statistics. Most importantly, these statistics include what has been watched, who watched it, when and where they watched it, and how it was watched.",
  instructions: null,
  changeLog: [{ date: "2023-1-26", description: "first release" }],
  links: [
    { label: "Website", url: "https://tautulli.com/" },
    { label: "Github", url: "https://github.com/Tautulli/Tautulli" },
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
        default: "tautuilli",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lscr.io/linuxserver/tautulli:2.11.1",
      },
    },
  },
  logo: "logo.png",
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
