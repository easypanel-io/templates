import {
  bcryptHash,
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const databasePassword = randomPassword();
  const jwtEncryptionKey = randomString(32);
  const adminPassword = randomPassword();
  const adminSalt = randomString(16);
  const adminHash = bcryptHash(adminSalt + adminPassword);
  const databaseHost = `$(PROJECT_NAME)_${databaseServiceName}`;

  const initScript = `set -e
export PGHOST=${databaseHost} PGUSER=postgres PGPASSWORD=${databasePassword}
until psql -d $(PROJECT_NAME) -tAc "SELECT 1 FROM users WHERE username = 'admin'" 2>/dev/null | grep -q 1; do
  echo "Waiting for admin user"
  sleep 3
done
row=$(psql -d $(PROJECT_NAME) -tA -F ' ' -c "SELECT salt, password FROM users WHERE username = 'admin'")
salt=\${row%% *}
hash=\${row#* }
psql -d postgres -qc "CREATE EXTENSION IF NOT EXISTS pgcrypto"
stock=$(psql -d postgres -tA -v salt="$salt" -v hash="$hash" <<'SQL'
SELECT crypt(:'salt' || 'admin', :'hash') = :'hash';
SQL
)
if [ "$stock" = "t" ]; then
  psql -d $(PROJECT_NAME) -q <<'SQL'
UPDATE users SET salt = '${adminSalt}', password = '${adminHash}' WHERE username = 'admin';
SQL
  echo "Admin password set"
fi
exec tail -f /dev/null
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `ghcr.io/jovandeginste/workout-tracker:${input.workoutTrackerVersion}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `WT_DATABASE_DRIVER=postgres`,
        `WT_DSN=host=${databaseHost} user=postgres password=${databasePassword} dbname=$(PROJECT_NAME) port=5432 sslmode=disable TimeZone=UTC`,
        `WT_JWT_ENCRYPTION_KEY=${jwtEncryptionKey}`,
        `WT_REGISTRATION_DISABLED=${
          input.registrationDisabled ? "true" : "false"
        }`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-init`,
      source: {
        type: "image",
        image: "postgres:17-alpine",
      },
      env: `ADMIN_PASSWORD=${adminPassword}`,
      deploy: {
        command: "sh /init.sh",
      },
      mounts: [
        {
          type: "file",
          content: initScript,
          mountPath: "/init.sh",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
