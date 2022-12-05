// Generated using "yarn build-templates"

export const meta = {
  name: "Gotify",
  description:
    "Gotify is a simple server for sending and receiving messages.Both Gotify's API and user interface are designed to be as simple as possible.Gotify is written in Go and can be easily compiled for different platforms.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://gotify.net/" },
    { label: "Documentation", url: "https://gotify.net/docs/" },
    { label: "Github", url: "https://github.com/gotify" },
  ],
  contributors: [
    { name: "Ponkhy", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage", "password"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "gotify",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "gotify/server:2.1.7",
      },
      password: { type: "string", title: "Password" },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type Password = string;
export type Timezone = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  password: Password;
  serviceTimezone?: Timezone;
}
