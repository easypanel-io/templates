// Generated using "yarn build-templates"

export const meta = {
  name: "Visual Studio Code Server",
  description:
    "Code-server is VS Code running on a remote server, accessible through the browser.",
  instructions: null,
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/linuxserver/docker-code-server/blob/master/README.md",
    },
    {
      label: "Github",
      url: "https://github.com/linuxserver/docker-code-server",
    },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      vscsPassword: {
        type: "string",
        title: "Visual Studio Code Server Password",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "vsc-server",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lscr.io/linuxserver/code-server:4.8.1-ls138",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type VisualStudioCodeServerPassword = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  vscsPassword?: VisualStudioCodeServerPassword;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
