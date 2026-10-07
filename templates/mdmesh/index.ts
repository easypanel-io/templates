import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const crypto = require("crypto");
  const dbPassword = randomPassword();
  const hashSecret = crypto.randomBytes(24).toString("hex");
  const adminPassword = input.adminPassword?.trim()
    ? input.adminPassword.trim()
    : randomPassword();

  const md5Upper = crypto
    .createHash("md5")
    .update(adminPassword)
    .digest("hex")
    .toUpperCase();
  const adminPasswordHash = crypto
    .createHash("sha1")
    .update(`${md5Upper}5YdSYHyg2U`)
    .digest("hex");

  const caddyFile = `{
	servers {
		trusted_proxies static 127.0.0.1/32 ::1/128
	}
}

:80 {
	encode gzip

	@backend path /rest/* /files/* /agent/ws/*
	handle @backend {
		reverse_proxy {$BACKEND_HOST}:8080
	}

	@healthz path /healthz /healthz/
	handle @healthz {
		reverse_proxy {$BACKEND_HOST}:8080 {
			rewrite /rest/public/name
			@up status 2xx
			handle_response @up {
				respond "ok" 200
			}
			handle_response {
				respond "server unavailable" 503
			}
		}
	}

	handle {
		root * /srv
		try_files {path} /index.html
		file_server
	}
}
`;

  const initSql = `UPDATE users SET password='${adminPasswordHash}', passwordreset=false WHERE login='admin';

INSERT INTO settings (id, backgroundcolor, textcolor, backgroundimageurl, iconsize, desktopheader, customerid, usedefaultlanguage, language)
VALUES (1, '#678ca6', '#ffffff', NULL, 'SMALL', 'NO_HEADER', 1, true, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO applications (id, pkg, name, showicon, customerid, system, latestversion, runafterinstall)
VALUES (46, 'com.hmdm.launcher', 'Headwind MDM', false, 1, false, NULL, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO applicationversions (id, applicationid, version, url)
VALUES (10045, 46, '1.0', 'https://h-mdm.com/files/agent.apk')
ON CONFLICT (id) DO NOTHING;

UPDATE applications SET latestversion=10045 WHERE id=46;

INSERT INTO configurations (id, name, description, type, password, backgroundcolor, textcolor, backgroundimageurl, iconsize, desktopheader, usedefaultdesignsettings, customerid, mainappid, eventreceivingcomponent, kioskmode, qrcodekey, pushoptions, keepalivetime)
VALUES (1, 'Default', 'Default configuration.', 0, '12345678', '', '', NULL, 'SMALL', 'NO_HEADER', true, 1, 46, 'com.hmdm.launcher.AdminReceiver', false, md5(random()::text), 'mqttAlarm', 300)
ON CONFLICT (id) DO NOTHING;

UPDATE settings SET createnewdevices=true, newdeviceconfigurationid=COALESCE(newdeviceconfigurationid, 1);
`;

  const initScript = `set -e
export PGPASSWORD="$DB_PASSWORD"
PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1 -qAt"

echo "Waiting for the server's first-boot migrations to create the schema..."
until $PSQL -c "SELECT 1 FROM information_schema.tables WHERE table_name='settings'" 2>/dev/null | grep -q 1; do
  sleep 5
done

echo "Applying defaults..."
$PSQL --single-transaction -f /seed/init.sql
echo "Done."
`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      databaseName: "mdmesh",
      user: "mdmesh",
      password: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=5432`,
        `DB_NAME=mdmesh`,
        `DB_USER=mdmesh`,
        `DB_PASSWORD=${dbPassword}`,
        `BASE_URL=https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`,
        `HASH_SECRET=${hashSecret}`,
        `SECURE_ENROLLMENT=0`,
        `SMTP_HOST=`,
        `SMTP_PORT=25`,
        `SMTP_FROM=mdm@localhost`,
        `SMTP_USERNAME=`,
        `SMTP_PASSWORD=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.serverServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/mdmesh",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-init`,
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=5432`,
        `DB_NAME=mdmesh`,
        `DB_USER=mdmesh`,
        `DB_PASSWORD=${dbPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "postgres:17-alpine",
      },
      deploy: {
        command: "sh /seed/run.sh",
      },
      mounts: [
        {
          type: "file",
          content: initSql,
          mountPath: "/seed/init.sql",
        },
        {
          type: "file",
          content: initScript,
          mountPath: "/seed/run.sh",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`BACKEND_HOST=$(PROJECT_NAME)_${input.appServiceName}-server`].join(
        "\n"
      ),
      source: {
        type: "image",
        image: input.webServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: caddyFile,
          mountPath: "/etc/caddy/Caddyfile",
        },
      ],
    },
  });

  return { services };
}
