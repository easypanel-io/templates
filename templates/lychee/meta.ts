// Generated using "yarn build-templates"

export const meta = {
  name: "Lychee",
  description:
    "Lychee is a free photo-management tool, which runs on your server or web-space. Installing is a matter of seconds. Upload, manage and share photos like from a native application. Lychee comes with everything you need and all your photos are stored securely.",
  instructions:
    "Lychee takes a few minutes to get ready. Sit back, relax, and have a coffee!",
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    { label: "Website", url: "https://lycheeorg.github.io/" },
    { label: "Documentation", url: "https://lycheeorg.github.io/docs/" },
    { label: "Github", url: "https://github.com/LycheeOrg/Lychee" },
    { label: "Demo", url: "https://lycheeorg.github.io/demo/" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "databaseType",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "lychee",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lycheeorg/lychee:v4.6.1",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "sqlite",
        oneOf: [{ enum: ["sqlite"], title: "SQLite" }],
      },
    },
  },
  logo: "icon.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseType = DatabaseType1 & DatabaseType2;
export type DatabaseType1 = SQLite;
export type SQLite = "sqlite";
export type DatabaseType2 = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseType: DatabaseType;
}
