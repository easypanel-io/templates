// Generated using "yarn build-templates"

export const meta = {
  name: "Dashy",
  description:
    "Dashy helps you organize your self-hosted services by making them accessible from a single place",
  instructions:
    "After deploying the project, it may take a while before the app is available (5 minutes).",
  changeLog: [{ date: "2022-08-18", description: "first release" }],
  links: [
    { label: "Website", url: "https://dashy.to/" },
    { label: "Documentation", url: "https://dashy.to/docs/" },
    { label: "Github", url: "https://github.com/lissy93/dashy" },
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
      serviceName: { type: "string", title: "Service Name", default: "dashy" },
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
