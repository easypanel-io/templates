// Generated using "yarn build-templates"

export const meta = {
  name: "Memos",
  description:
    "An open-source, self-hosted memo hub with knowledge management and socialization.",
  instructions: null,
  changeLog: [{ date: "2022-12-21", description: "First Release" }],
  links: [
    { label: "Website", url: "https://usememos.com/" },
    {
      label: "Documentation",
      url: "https://github.com/usememos/memos#deploy-with-docker-in-seconds",
    },
    { label: "Github", url: "https://github.com/usememos/memos" },
  ],
  contributors: [{ name: "DrMxrcy", url: "https://github.com/DrMxrcy" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "memos",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "neosmemo/memos:0.8.3",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "America/New_York",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type Timezone = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  serviceTimezone?: Timezone;
}
