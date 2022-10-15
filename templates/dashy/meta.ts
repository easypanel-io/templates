// Generated using "yarn build-templates"

export const meta = {
  name: "Dashy",
  description:
    "Dashy helps you organize your self-hosted services by making them accessible from a single place",
  instructions:
    "After deploying the project, it may take a while before the app is available (5 minutes).",
  changeLog: [{ date: "2022-08-18", description: "first release" }],
  links: [
    { label: "Website", url: "https://dashy.to/" },
    { label: "Documentation", url: "https://dashy.to/docs/" },
    { label: "Github", url: "https://github.com/lissy93/dashy" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "dashy",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lissy93/dashy:2.1.1",
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
