// Generated using "yarn build-templates"

export const meta = {
  name: "Budibase",
  description:
    "Budibase is an open source low-code platform, and the easiest way to build internal apps that improve productivity.",
  instructions:
    "Budibase takes a few minutes to get ready. Sit back, relax, and have a cup of tea!",
  changeLog: [{ date: "2022-10-30", description: "first release" }],
  links: [
    { label: "Website", url: "https://budibase.com/" },
    { label: "Documentation", url: "https://docs.budibase.com/docs" },
    { label: "Github", url: "https://github.com/Budibase/budibase" },
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
        default: "budibase",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "budibase/budibase:v2.0.37",
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
