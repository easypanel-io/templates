// Generated using "yarn build-templates"

export const meta = {
  name: "Whiteboard",
  description: "Lightweight collaborative Whiteboard / Sketchboard ",
  instructions: null,
  changeLog: [{ date: "2022-08-01", description: "first release" }],
  links: [
    { label: "Website", url: "https://github.com/cracker0dks/whiteboard" },
    {
      label: "Documentation",
      url: "https://github.com/cracker0dks/whiteboard",
    },
    { label: "Github", url: "https://github.com/cracker0dks/whiteboard" },
  ],
  contributors: [{ name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "domain"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "whiteboard",
      },
      domain: { type: "string", title: "Domain" },
    },
  },
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
}
