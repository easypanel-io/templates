// Generated using "yarn build-templates"

export const meta = {
  name: "Change Detection",
  description:
    "The best and simplest self-hosted free open source website change detection tracking, monitoring, and notification service. An alternative to Visualping, Watchtower etc. Designed for simplicity - the main goal is to simply monitor which websites had a text change for free.",
  instructions: null,
  changeLog: [{ date: "2022-08-15", description: "first release" }],
  links: [
    { label: "Website", url: "https://changedetection.io" },
    { label: "Github", url: "https://github.com/dgtlmoon/changedetection.io" },
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
        default: "changedetection",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/dgtlmoon/changedetection.io:0.39.19",
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
