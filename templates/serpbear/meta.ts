// Generated using "yarn build-templates"

export const meta = {
  name: "SerpBear",
  description:
    "SerpBear is an Open Source Search Engine Position Tracking App. It allows you to track your website's keyword positions in Google and get notified of their positions.",
  instructions: null,
  changeLog: [{ date: "2023-1-5", description: "first release" }],
  links: [
    { label: "Documentation", url: "https://docs.serpbear.com/" },
    { label: "Github", url: "https://github.com/towfiqi/serpbear" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "serpUser",
      "serpPass",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "serpbear",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "towfiqi/serpbear",
      },
      serpUser: { type: "string", title: "Username" },
      serpPass: { type: "string", title: "Password" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot1.png", "screenshot2.png", "screenshot3.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type Username = string;
export type Password = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  serpUser: Username;
  serpPass: Password;
}
