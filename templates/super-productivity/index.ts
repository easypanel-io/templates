import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const webdavPassword = input.webdavPassword || randomPassword();

  const webdavConfig = `address: 0.0.0.0
port: 2345
prefix: /
permissions: CRUD
cors:
  enabled: true
  credentials: true
  allowed_headers:
    - '*'
  allowed_hosts:
    - '*'
  allowed_methods:
    - GET
    - HEAD
    - POST
    - PUT
    - DELETE
    - OPTIONS
    - PROPFIND
    - PROPPATCH
    - MKCOL
    - COPY
    - MOVE
    - LOCK
    - UNLOCK
  exposed_headers:
    - '*'
users:
  - username: ${input.webdavUsername}
    password: ${webdavPassword}
    directory: /data
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `WEBDAV_BACKEND=http://$(PROJECT_NAME)_${input.webdavServiceName}:2345/`,
        `WEBDAV_BASE_URL=/webdav/`,
        `WEBDAV_USERNAME=${input.webdavUsername}`,
        `WEBDAV_SYNC_FOLDER_PATH=/`,
        `SYNC_INTERVAL=15`,
        `IS_COMPRESSION_ENABLED=true`,
        `IS_ENCRYPTION_ENABLED=false`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.webdavServiceName,
      source: { type: "image", image: input.webdavServiceImage },
      mounts: [
        {
          type: "file",
          content: webdavConfig,
          mountPath: "/etc/webdav/config.yaml",
        },
        { type: "volume", name: "data", mountPath: "/data" },
      ],
    },
  });

  return { services };
}
