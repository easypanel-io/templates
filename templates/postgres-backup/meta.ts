// Generated using "yarn build-templates"

export const meta = {
  name: "Postgres Backup",
  description:
    "Backup Postgres to S3. Supports periodic backups & mutli files.",
  instructions:
    "In order to test that you configured it properly, remove the SCHEDULE variable from the environment, click deploy and check the logs. If everything works fine, you can add the SCHEDULE variable back. You can read more about the environment variables here: https://github.com/schickling/dockerfiles/tree/master/postgres-backup-s3",
  changeLog: [{ date: "2022-08-05", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/schickling/dockerfiles/tree/master/postgres-backup-s3",
    },
    {
      label: "Github",
      url: "https://github.com/schickling/dockerfiles/tree/master/postgres-backup-s3",
    },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "host",
      "port",
      "user",
      "password",
      "accessKey",
      "secretKey",
      "bucket",
      "prefix",
      "region",
      "endpoint",
      "schedule",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "postgres-backup",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "easypanel/postgres-backup-s3",
      },
      host: { type: "string", title: "Postgres Host" },
      port: { type: "string", title: "Postgres Port", default: "5432" },
      user: { type: "string", title: "Postgres User", default: "postgres" },
      password: { type: "string", title: "Postgres Password" },
      accessKey: { type: "string", title: "S3 Access Key" },
      secretKey: { type: "string", title: "S3 Secret Key" },
      bucket: { type: "string", title: "S3 Bucket" },
      prefix: { type: "string", title: "S3 Prefix", default: "backup" },
      region: { type: "string", title: "S3 Region", default: "us-west-1" },
      endpoint: { type: "string", title: "S3 Endpoint" },
      schedule: {
        type: "string",
        title: "Schedule",
        default: "@daily",
        description: "You can use CRON syntax",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type PostgresHost = string;
export type PostgresPort = string;
export type PostgresUser = string;
export type PostgresPassword = string;
export type S3AccessKey = string;
export type S3SecretKey = string;
export type S3Bucket = string;
export type S3Prefix = string;
export type S3Region = string;
export type S3Endpoint = string;
/**
 * You can use CRON syntax
 */
export type Schedule = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  host: PostgresHost;
  port: PostgresPort;
  user: PostgresUser;
  password: PostgresPassword;
  accessKey: S3AccessKey;
  secretKey: S3SecretKey;
  bucket: S3Bucket;
  prefix: S3Prefix;
  region: S3Region;
  endpoint: S3Endpoint;
  schedule: Schedule;
}
