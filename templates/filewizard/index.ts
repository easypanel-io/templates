import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(48);
  const localOnly = input.localOnly !== false;
  const downloadKokoroOnStartup = input.downloadKokoroOnStartup !== false;
  const ompNumThreads = input.ompNumThreads || "1";

  const env = [
    `LOCAL_ONLY=${localOnly ? "True" : "False"}`,
    `SECRET_KEY=${secretKey}`,
    `UPLOADS_DIR=/app/uploads`,
    `PROCESSED_DIR=/app/processed`,
    `OMP_NUM_THREADS=${ompNumThreads}`,
    `DOWNLOAD_KOKORO_ON_STARTUP=${downloadKokoroOnStartup ? "true" : "false"}`,
  ];

  if (input.transcriptionDevice) {
    env.push(`TRANSCRIPTION_DEVICE=${input.transcriptionDevice}`);
  }
  if (input.transcriptionComputeType) {
    env.push(`TRANSCRIPTION_COMPUTE_TYPE=${input.transcriptionComputeType}`);
  }
  if (input.transcriptionDeviceIndex) {
    env.push(`TRANSCRIPTION_DEVICE_INDEX=${input.transcriptionDeviceIndex}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "processed",
          mountPath: "/app/processed",
        },
      ],
    },
  });

  return { services };
}
