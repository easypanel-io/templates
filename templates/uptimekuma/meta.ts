// Generated using "yarn build-templates"

export const meta = {
  name: "UptimeKuma",
  description: "A fancy self-hosted monitoring tool",
  instructions: null,
  changeLog: [{ date: "2022-08-02", description: "first release" }],
  links: [
    { label: "Website", url: "https://uptime.kuma.pet" },
    {
      label: "Documentation",
      url: "https://github.com/louislam/uptime-kuma/wiki",
    },
    { label: "Github", url: "https://github.com/louislam/uptime-kuma" },
  ],
  contributors: [{ name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" }],
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "uptimekuma",
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
