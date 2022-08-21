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
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain", "password"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "flame",
      },
      domain: { type: "string", title: "Domain" },
      password: { type: "string", title: "Password" },
    },
  },
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type Password = string;

export interface Input {
  projectName: ProjectName;
  serviceName: AppServiceName;
  domain: Domain;
  password: Password;
}
