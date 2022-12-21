// Generated using "yarn build-templates"

export const meta = {
  name: "Kavita",
  description:
    "Lighting fast with a slick design, Kavita is a rocket fueled self-hosted digital library which supports a vast array of file formats. Install to start reading and share your server with your friends.",
  instructions: null,
  changeLog: [{ date: "2022-12-21", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.kavitareader.com/" },
    { label: "Documentation", url: "https://wiki.kavitareader.com/" },
    { label: "Github", url: "https://github.com/Kareadita/Kavita" },
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
        default: "kavita",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "kizaing/kavita:0.6.1",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "America/New_York",
      },
    },
  },
  logo: "logo.svg",
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
