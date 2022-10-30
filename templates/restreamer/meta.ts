// Generated using "yarn build-templates"

export const meta = {
  name: "Restreamer",
  description:
    "Self-hosting solution to stream live to your website and publish to many like YouTube-Live, Twitter, Twitch, Vimeo, and other platforms or services.",
  instructions: null,
  changeLog: [{ date: "2022-10-29", description: "first release" }],
  links: [
    { label: "Documentation", url: "https://docs.datarhei.com/restreamer/" },
    { label: "Github", url: "https://github.com/datarhei/restreamer" },
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
        default: "restreamer",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "datarhei/restreamer:2.3.0",
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
