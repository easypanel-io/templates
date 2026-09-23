import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const authSecret = randomString(32);
  const minioRootUser = randomString(16);
  const minioRootPassword = randomPassword();

  const runtimeSeedJson = JSON.stringify({
    version: 1,
    runtimeConfig: { defaultTtsProvider: "kokoro" },
    providers: [
      {
        slug: "kokoro",
        displayName: "Kokoro",
        providerType: "custom-openai",
        baseUrl: `http://$(PROJECT_NAME)_${input.appServiceName}-kokoro:8880/v1`,
        defaultModel: "kokoro",
        enabled: true,
      },
    ],
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `AUTH_SECRET=${authSecret}`,
        `USE_EMBEDDED_WEED_MINI=false`,
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-s3:9000`,
        `S3_BUCKET=openreader-documents`,
        `S3_REGION=us-east-1`,
        `S3_ACCESS_KEY_ID=${minioRootUser}`,
        `S3_SECRET_ACCESS_KEY=${minioRootPassword}`,
        `S3_FORCE_PATH_STYLE=true`,
        `RUNTIME_SEED_JSON=${runtimeSeedJson}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "docstore",
          mountPath: "/app/docstore",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3003,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-kokoro`,
      source: {
        type: "image",
        image: input.kokoroServiceImage,
      },
      env: [
        `ONNX_NUM_THREADS=8`,
        `ONNX_INTER_OP_THREADS=4`,
        `ONNX_EXECUTION_MODE=parallel`,
        `ONNX_OPTIMIZATION_LEVEL=all`,
        `ONNX_MEMORY_PATTERN=true`,
        `ONNX_ARENA_EXTEND_STRATEGY=kNextPowerOfTwo`,
        `API_LOG_LEVEL=INFO`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-s3`,
      source: {
        type: "image",
        image: input.s3ServiceImage,
      },
      env: [
        `MINIO_ROOT_USER=${minioRootUser}`,
        `MINIO_ROOT_PASSWORD=${minioRootPassword}`,
      ].join("\n"),
      deploy: {
        command: "server /data --console-address :9001",
      },
      mounts: [
        {
          type: "volume",
          name: "s3-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
