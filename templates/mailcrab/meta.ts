// Generated using "yarn build-templates"

export const meta = {
  name: "MailCrab",
  description: "Email test server for development, written in Rust.",
  instructions: null,
  changeLog: [{ date: "2022-11-5", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/tweedegolf/mailcrab" }],
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
        default: "mailcrab",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "marlonb/mailcrab:latest",
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
