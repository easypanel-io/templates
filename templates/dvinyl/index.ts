import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const jwtSecret = randomPassword();
  const sessionSecret = randomString(32);
  const mongoPassword = randomPassword();

  const env = [
    `MONGODB_URL=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.mongoServiceName}:27017/dvinyl?authSource=admin`,
    `PASSJWT=${jwtSecret}`,
    `SESSION_SECRET=${sessionSecret}`,
    `PROD=false`,
    `VINYL_PORT=3099`,
    `BASE_URL=`,
    `DISCOGS_TOKEN=${input.discogsToken || ""}`,
    `HARDCOVER_API_KEY=${input.hardcoverApiKey || ""}`,
    `TMDB_API_KEY=${input.tmdbApiKey || ""}`,
    `TWITCH_CLIENT_ID=${input.twitchClientId || ""}`,
    `TWITCH_CLIENT_SECRET=${input.twitchClientSecret || ""}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3099 }],
      env: env.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/public/uploads",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: input.mongoServiceName,
      password: mongoPassword,
    },
  });

  return { services };
}
