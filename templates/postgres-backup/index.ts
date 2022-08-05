import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Postgres Backup",
  meta: {
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
    contributors: [
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
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
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "postgres-backup",
      },
      host: {
        type: "string",
        title: "Postgres Host",
      },
      port: {
        type: "string",
        title: "Postgres Port",
        default: "5432",
      },
      user: {
        type: "string",
        title: "Postgres User",
        default: "postgres",
      },
      password: {
        type: "string",
        title: "Postgres Password",
      },
      accessKey: {
        type: "string",
        title: "S3 Access Key",
      },
      secretKey: {
        type: "string",
        title: "S3 Secret Key",
      },
      bucket: {
        type: "string",
        title: "S3 Bucket",
      },
      prefix: {
        type: "string",
        title: "S3 Prefix",
        default: "backup",
      },
      region: {
        type: "string",
        title: "S3 Region",
        default: "us-west-1",
      },
      endpoint: {
        type: "string",
        title: "S3 Endpoint",
      },
      schedule: {
        type: "string",
        title: "Schedule",
        default: "@daily",
        description: "You can use CRON syntax",
      },
    },
  } as const,
  generate({ projectName, serviceName, ...other }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName,
        source: {
          type: "image",
          image: "easypanel/postgres-backup-s3",
        },
        env: [
          `POSTGRES_HOST=${other.host}`,
          `POSTGRES_PORT=${other.port}`,
          `POSTGRES_USER=${other.user}`,
          `POSTGRES_PASSWORD=${other.password}`,
          `POSTGRES_BACKUP_ALL=true`,
          `S3_ACCESS_KEY_ID=${other.accessKey}`,
          `S3_SECRET_ACCESS_KEY=${other.secretKey}`,
          `S3_BUCKET=${other.bucket}`,
          `S3_PREFIX=${other.prefix}`,
          `S3_REGION=${other.region}`,
          `S3_ENDPOINT=${other.endpoint}`,
          `S3_S3V4=yes`,
          `SCHEDULE=${other.schedule}`,
        ].join("\n"),
      },
    });

    return { services };
  },
});
