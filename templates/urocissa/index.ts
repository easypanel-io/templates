import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const authKey = randomString(64);
  const urocissaPath = "/data/urocissa";
  const password = input.password || randomPassword();

  const config = JSON.stringify(
    {
      public: {
        address: "0.0.0.0",
        port: 5673,
        limits: {
          file: "10GiB",
          json: "10MiB",
          "data-form": "10GiB",
        },
        syncPaths: [],
        discordHookUrl: null,
        readOnlyMode: false,
        disableImg: false,
      },
      private: {
        password: password,
        authKey,
      },
    },
    null,
    2
  );

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 5673 }],
      env: [`UROCISSA_PATH=${urocissaPath}`].join("\n"),
      mounts: [
        {
          type: "file",
          content: config,
          mountPath: `${urocissaPath}/gallery-backend/config.json`,
        },
        {
          type: "volume",
          name: "db",
          mountPath: `${urocissaPath}/gallery-backend/db`,
        },
        {
          type: "volume",
          name: "object",
          mountPath: `${urocissaPath}/gallery-backend/object`,
        },
        {
          type: "volume",
          name: "upload",
          mountPath: `${urocissaPath}/gallery-backend/upload`,
        },
      ],
    },
  });

  return { services };
}
