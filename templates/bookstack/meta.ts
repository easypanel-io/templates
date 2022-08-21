// Generated using "yarn build-templates"

export const meta = {
  name: "Bookstack",
  description:
    "BookStack is a simple, self-hosted, easy-to-use platform for organising and storing information.The content in BookStack is fully searchable. You are able to search at book level or across all books, chapters & pages.BookStack is built using PHP, on top of the Laravel framework and it uses MySQL to store data.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.bookstackapp.com/" },
    { label: "Documentation", url: "https://www.bookstackapp.com/docs/" },
    { label: "Github", url: "https://github.com/BookStackApp/BookStack" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "domain",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "bookstack",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "bookstack-db",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  databaseServiceName: DatabaseServiceName;
}
