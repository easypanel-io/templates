// Generated using "yarn build-templates"

export const meta = {
  name: "Filezilla Client",
  description:
    "FIleZilla Client is a fast and reliable cross-platform FTP, FTPS and SFTP client with lots of useful features and an intuitive graphical user interface.",
  instructions:
    "use abc:abc to login. To access the login interface, add ?login=true to your URL.",
  changeLog: [{ date: "2022-11-21", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://docs.linuxserver.io/images/docker-filezilla",
    },
    { label: "Github", url: "https://github.com/linuxserver/docker-filezilla" },
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
        default: "filezilla",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lscr.io/linuxserver/filezilla:latest",
      },
    },
  },
  logo: null,
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
