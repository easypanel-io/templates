// Generated using "yarn build-templates"

export const meta = {
  name: "Meilisearch",
  description:
    "Meilisearch is a lightning-fast search engine that fits effortlessly into your apps, websites, and workflow.",
  instructions: null,
  changeLog: [{ date: "2022-10-31", description: "first release" }],
  links: [
    { label: "Website", url: "https://meilisearch.com/" },
    { label: "Documentation", url: "https://docs.meilisearch.com/" },
    { label: "Github", url: "https://github.com/meilisearch/meilisearch/" },
    { label: "Discord", url: "https://discord.gg/meilisearch" },
  ],
  contributors: [{ name: "Rubén Robles", url: "https://github.com/D8vjork" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "dataVolumeName",
      "meiliEnv",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "meilisearch",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "getmeili/meilisearch:v0.30",
      },
      dataVolumeName: {
        type: "string",
        title: "Meilisearch Database Volume Name",
        default: "meilisearch",
      },
      meiliEnv: {
        type: "string",
        title: "Meilisearch Environment",
        default: "production",
        oneOf: [
          { enum: ["production"], title: "Production" },
          { enum: ["development"], title: "Development" },
        ],
      },
      meiliMasterKey: { type: "string", title: "Meilisearch Master Key" },
      meiliNoAnalytics: {
        type: "boolean",
        title: "Disable Meilisearch Analytics",
        default: false,
      },
      meiliScheduleSnapshot: {
        type: "boolean",
        title: "Enable Database Scheduled Snapshots",
        default: false,
      },
      meiliSnapshotInterval: {
        type: "string",
        title: "Scheduled Snapshots Interval (in seconds)",
        default: "86400",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type MeilisearchDatabaseVolumeName = string;
export type MeilisearchEnvironment = MeilisearchEnvironment1 &
  MeilisearchEnvironment2;
export type MeilisearchEnvironment1 = Production | Development;
export type Production = "production";
export type Development = "development";
export type MeilisearchEnvironment2 = string;
export type MeilisearchMasterKey = string;
export type DisableMeilisearchAnalytics = boolean;
export type EnableDatabaseScheduledSnapshots = boolean;
export type ScheduledSnapshotsIntervalInSeconds = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  dataVolumeName: MeilisearchDatabaseVolumeName;
  meiliEnv: MeilisearchEnvironment;
  meiliMasterKey?: MeilisearchMasterKey;
  meiliNoAnalytics?: DisableMeilisearchAnalytics;
  meiliScheduleSnapshot?: EnableDatabaseScheduledSnapshots;
  meiliSnapshotInterval?: ScheduledSnapshotsIntervalInSeconds;
}
