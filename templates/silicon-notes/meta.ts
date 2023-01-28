// Generated using "yarn build-templates"

export const meta = {
  name: "Silicon Notes",
  description: "https://github.com/cu/silicon",
  instructions: null,
  changeLog: [{ date: "2023-1-28", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/cu/silicon" }],
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
        default: "silicon",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "bityard/silicon:619334fb58a09c4208008316062c0ded0caefb5b",
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
