// Generated using "yarn build-templates"

export const meta = {
  name: "PsiTransfer",
  description:
    "Simple open source self-hosted file sharing solution. It's an alternative to paid services like Dropbox, WeTransfer.No accounts, no logins. Mobile friendly responsive interface.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/psi-4ward/psitransfer/tree/master/docs",
    },
    { label: "Github", url: "https://github.com/psi-4ward/psitransfer" },
  ],
  contributors: [
    { name: "Mark Topper", url: "https://github.com/marktopper" },
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
        default: "psitransfer",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "psitrax/psitransfer:v2.1.1",
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
