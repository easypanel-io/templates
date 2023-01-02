// Generated using "yarn build-templates"

export const meta = {
  name: "Homarr",
  description:
    "Homarr is a simple and lightweight homepage for your server, that helps you easily access all of your services in one place. It integrates with the services you use to display information on the homepage (E.g. Show upcoming Sonarr/Radarr releases).For a full list of integrations, head over to our documentation",
  instructions: null,
  changeLog: [{ date: "2022-12-20", description: "first release" }],
  links: [
    { label: "Website", url: "https://homarr.dev/" },
    { label: "Documentation", url: "https://homarr.dev/docs/" },
    { label: "Github", url: "https://github.com/ajnart/homarr" },
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
        default: "homarr",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/ajnart/homarr:0.10.7",
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
