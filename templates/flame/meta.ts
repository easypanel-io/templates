// Generated using "yarn build-templates"

export const meta = {
  name: "Flame",
  description:
    "Flame is self-hosted startpage for your server. Its design is inspired (heavily) by SUI. Flame is very easy to setup and use. With built-in editors, it allows you to setup your very own application hub in no time - no file editing necessary",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://github.com/pawelmalak/flame" },
    { label: "Documentation", url: "https://github.com/pawelmalak/flame" },
    { label: "Github", url: "https://github.com/pawelmalak/flame" },
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
        default: "flame",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "pawelmalak/flame:multiarch2.3.0",
      },
      password: { type: "string", title: "Password" },
    },
  },
  logo: null,
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type Password = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  password: Password;
}
