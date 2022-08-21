// Generated using "yarn build-templates"

export const meta = {
  name: "Wordpress",
  description:
    "WordPress powers nearly a third of the world’s websites. With tools for everyone from personal bloggers to large corporations, this powerful site builder and content management system (cms) aims to make it possible for anyone to create an online presence in minutes.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://wordpress.org/" },
    { label: "Documentation", url: "https://learn.wordpress.org" },
    { label: "Github", url: "https://github.com/WordPress/WordPress" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "mysqlServiceName"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "web",
      },
      mysqlServiceName: {
        type: "string",
        title: "MySQL Service Name",
        default: "db",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type MySQLServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  mysqlServiceName: MySQLServiceName;
}
