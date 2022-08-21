// Generated using "yarn build-templates"

export const meta = {
  name: "Appsmith",
  description:
    "Appsmith is the open-source framework that lets your team build custom internal applications like dashboards, admin panels, CRUD apps faster, and together",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.appsmith.com/" },
    { label: "Documentation", url: "https://docs.appsmith.com/" },
    { label: "Github", url: "https://github.com/appsmithorg/appsmith" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "domain"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "appsmith",
      },
      domain: { type: "string", title: "Domain" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
}
