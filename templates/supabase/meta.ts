// Generated using "yarn build-templates"

export const meta = {
  name: "Supabase",
  description:
    "Supabase is an open source Firebase alternative. Start your project with a Postgres Database, Authentication, instant APIs, Realtime subscriptions and Storage.",
  instructions: null,
  changeLog: [{ date: "2022-08-25", description: "first release" }],
  links: [
    { label: "Website", url: "https://supabase.com/" },
    { label: "Documentation", url: "https://supabase.com/docs/" },
    { label: "Github", url: "https://github.com/supabase/supabase" },
  ],
  contributors: [{ name: "Ciprian", url: "https://github.com/cipiloosh" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "domain",
      "studioServiceName",
      "metaDatabaseServiceName",
      "storageServiceName",
      "realtimeServiceName",
      "restServiceName",
      "authServiceName",
      "kongServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "supabase",
      },
      domain: { type: "string", title: "Domain" },
      studioServiceName: {
        type: "string",
        title: "Studio Service Name",
        default: "supabase-studio",
      },
      metaDatabaseServiceName: {
        type: "string",
        title: "Meta Database Service Name",
        defult: "supabase-meta",
      },
      storageServiceName: {
        type: "string",
        title: "Storage Service Name",
        default: "supabase-storage",
      },
      realtimeServiceName: {
        type: "string",
        title: "Realtime Service Name",
        default: "supabase-realtime",
      },
      restServiceName: {
        type: "string",
        title: "Rest Service Name",
        default: "supabase-rest",
      },
      authServiceName: {
        type: "string",
        title: "Auth Service Name",
        default: "supabase-auth",
      },
      kongServiceName: {
        type: "string",
        title: "Kong Service Name",
        default: "supabase-kong",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type StudioServiceName = string;
export type MetaDatabaseServiceName = string;
export type StorageServiceName = string;
export type RealtimeServiceName = string;
export type RestServiceName = string;
export type AuthServiceName = string;
export type KongServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  studioServiceName: StudioServiceName;
  metaDatabaseServiceName: MetaDatabaseServiceName;
  storageServiceName: StorageServiceName;
  realtimeServiceName: RealtimeServiceName;
  restServiceName: RestServiceName;
  authServiceName: AuthServiceName;
  kongServiceName: KongServiceName;
}
