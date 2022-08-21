// Generated using "yarn build-templates"

export const meta = {
  name: "Kanboard",
  description:
    "Kanboard is project management software that focuses on the Kanban methodology. There is no fancy user interface, Kanboard focuses on simplicity and minimalism. The number of features is voluntarily limited.",
  instructions: null,
  changeLog: [{ date: "2022-08-16", description: "first release" }],
  links: [
    { label: "Website", url: "https://kanboard.org/" },
    { label: "Documentation", url: "https://docs.kanboard.org/en/latest/" },
    { label: "Github", url: "https://github.com/kanboard/kanboard" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "kanboard",
      },
      domain: { type: "string", title: "Domain" },
    },
  },
};

export type ProjectName = string;
export type ServiceName = string;
export type Domain = string;

export interface Input {
  projectName: ProjectName;
  serviceName: ServiceName;
  domain: Domain;
}
