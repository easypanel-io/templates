import {
  Output,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const instanceSecret = randomString(64);

  const backendEnv = [
    `CONVEX_CLOUD_ORIGIN=${input.convexCloudOrigin || "https://$(PRIMARY_DOMAIN)"}`,
    `CONVEX_SITE_ORIGIN=${input.convexSiteOrigin || "https://$(PRIMARY_DOMAIN):3211"}`,
    `INSTANCE_SECRET=${input.instanceSecret || instanceSecret}`,
    `RUST_LOG=${input.rustLog || "info"}`,
    `DOCUMENT_RETENTION_DELAY=${input.documentRetentionDelay || "172800"}`,
    `DO_NOT_REQUIRE_SSL=true`,
    `DISABLE_BEACON=true`,
  ];

  if (input.databaseType && input.databaseType !== "none" && input.databaseUrl) {
    backendEnv.push(`${input.databaseType}=${input.databaseUrl}`);
  }
  if (input.instanceName) {
    backendEnv.push(`INSTANCE_NAME=${input.instanceName}`);
  }
  if (input.awsAccessKeyId) {
    backendEnv.push(`AWS_ACCESS_KEY_ID=${input.awsAccessKeyId}`);
  }
  if (input.awsSecretAccessKey) {
    backendEnv.push(`AWS_SECRET_ACCESS_KEY=${input.awsSecretAccessKey}`);
  }
  if (input.awsRegion) {
    backendEnv.push(`AWS_REGION=${input.awsRegion}`);
  }
  if (input.s3EndpointUrl) {
    backendEnv.push(`S3_ENDPOINT_URL=${input.s3EndpointUrl}`);
  }
  if (input.s3StorageFilesBucket) {
    backendEnv.push(`S3_STORAGE_FILES_BUCKET=${input.s3StorageFilesBucket}`);
  }
  if (input.s3StorageModulesBucket) {
    backendEnv.push(`S3_STORAGE_MODULES_BUCKET=${input.s3StorageModulesBucket}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3210,
        },
      ],
      env: backendEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/convex/data",
        },
      ],
      ports: [
        {
          published: 3210,
          target: 3210,
          protocol: "tcp",
        },
        {
          published: 3211,
          target: 3211,
          protocol: "tcp",
        },
      ],
    },
  });

  const dashboardEnv = [
    `NEXT_PUBLIC_DEPLOYMENT_URL=https://$(PROJECT_NAME)-${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
  ];

  if (input.nextPublicLoadMonacoInternally) {
    dashboardEnv.push(`NEXT_PUBLIC_LOAD_MONACO_INTERNALLY=${input.nextPublicLoadMonacoInternally}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-dashboard`,
      source: {
        type: "image",
        image: input.dashboardServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6791,
        },
      ],
      env: dashboardEnv.join("\n"),
    },
  });

  return { services };
}
