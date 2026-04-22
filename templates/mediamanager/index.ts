import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const tokenSecret = randomPassword() + randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  const configToml = `
# MediaManager Configuration File

[misc]
frontend_url = "https://$(PRIMARY_DOMAIN)"
cors_urls = ["https://$(PRIMARY_DOMAIN)"]

image_directory = "/data/images"
tv_directory = "/data/tv"
movie_directory = "/data/movies"
torrent_directory = "/data/torrents"

development = false

[[misc.tv_libraries]]
name = "TV Shows"
path = "/data/tv"

[[misc.movie_libraries]]
name = "Movies"
path = "/data/movies"

[database]
host = "$(PROJECT_NAME)_${input.appServiceName}-db"
port = 5432
user = "postgres"
password = "${databasePassword}"
dbname = "$(PROJECT_NAME)"

[auth]
email_password_resets = false
token_secret = "${tokenSecret}"
session_lifetime = 86400
admin_emails = ["admin@example.com"]

[auth.openid_connect]
enabled = false
client_id = ""
client_secret = ""
configuration_endpoint = ""
name = "OpenID"

[notifications]
[notifications.smtp_config]
smtp_host = "smtp.example.com"
smtp_port = 587
smtp_user = "admin"
smtp_password = "admin"
from_email = "mediamanager@example.com"
use_tls = true

[notifications.email_notifications]
enabled = false
emails = []

[notifications.gotify]
enabled = false
api_key = ""
url = ""

[notifications.ntfy]
enabled = false
url = ""

[notifications.pushover]
enabled = false
api_key = ""
user = ""

[torrents]
[torrents.qbittorrent]
enabled = false
host = "http://localhost"
port = 8080
username = "admin"
password = "admin"

[torrents.transmission]
enabled = false
username = "admin"
password = "admin"
https_enabled = false
host = "localhost"
port = 9091
path = "/transmission/rpc"

[torrents.sabnzbd]
enabled = false
host = "http://localhost"
port = 8080
api_key = ""
base_path = "/api"

[indexers]
[indexers.prowlarr]
enabled = false
url = ""
api_key = ""
reject_torrents_on_url_error = true

[indexers.jackett]
enabled = false
url = ""
api_key = ""
indexers = []

[metadata]
[metadata.tmdb]
tmdb_relay_url = "https://metadata-relay.dorninger.co/tmdb"

[metadata.tvdb]
tvdb_relay_url = "https://metadata-relay.dorninger.co/tvdb"
`.trim();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: [`CONFIG_DIR=/app/config`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "images",
          mountPath: "/data/images",
        },
        {
          type: "volume",
          name: "tv",
          mountPath: "/data/tv",
        },
        {
          type: "volume",
          name: "movies",
          mountPath: "/data/movies",
        },
        {
          type: "volume",
          name: "torrents",
          mountPath: "/data/torrents",
        },
        {
          type: "file",
          content: configToml,
          mountPath: "/app/config/config.toml",
        },
      ],
    },
  });

  return { services };
}
