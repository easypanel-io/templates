// Generated using "yarn build-templates"

export const meta = {
  name: "Adminer",
  description:
    "Adminer (formerly phpMinAdmin) is a full-featured database management tool written in PHP. Conversely to phpMyAdmin, it consist of a single file ready to deploy to the target server. Adminer is available for MySQL, MariaDB, PostgreSQL, SQLite, MS SQL, Oracle, Elasticsearch, MongoDB and others via plugin.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.adminer.org/" },
    { label: "Github", url: "https://github.com/vrana/adminer/" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
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
        default: "adminer",
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
