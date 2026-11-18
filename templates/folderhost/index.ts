import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = randomPassword();
  const jwtSecret = randomString(64);

  const config = `port: 5000
folder: "./host"
storage_limit: "10 GB"
secret_jwt_key: "${jwtSecret}"
admin:
  username: "admin"
  password: "${adminPassword}"
  email: "admin@example.com"
  scope: ""
  permissions:
    read_directories: true
    read_files: true
    create: true
    change: true
    delete: true
    move: true
    download: true
    upload: true
    rename: true
    extract: true
    archive: true
    copy: true
    read_recovery: true
    use_recovery: true
    read_users: true
    edit_users: true
    read_logs: true
recovery_bin: true
bin_storage_limit: "5 GB"
auto_cleanup_recovery: "7d"
log_activities: true
clear_logs_after: 7
ssl:
  enabled: false
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          "cd /data && mkdir -p host recovery_bin tmp && exec /app/folderhost",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "file",
          content: config,
          mountPath: "/data/config.yml",
        },
      ],
    },
  });

  return { services };
}
