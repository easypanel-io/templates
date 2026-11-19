import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const backServiceName = `${input.appServiceName}-back`;
  const uploaderServiceName = `${input.appServiceName}-uploader`;
  const mapStorageServiceName = `${input.appServiceName}-map-storage`;
  const iconServiceName = `${input.appServiceName}-icon`;
  const redisServiceName = `${input.appServiceName}-redis`;

  const secretKey = randomString(64);
  const roomApiSecretKey = randomString(64);
  const mapStorageApiToken = randomString(64);
  const mapStorageAuthPassword = randomPassword();
  const redisPassword = randomPassword();

  const playPublicUrl = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;
  const uploaderPublicUrl = `https://$(PROJECT_NAME)-${uploaderServiceName}.$(EASYPANEL_HOST)`;
  const mapStoragePublicUrl = `https://$(PROJECT_NAME)-${mapStorageServiceName}.$(EASYPANEL_HOST)`;
  const iconPublicUrl = `https://$(PROJECT_NAME)-${iconServiceName}.$(EASYPANEL_HOST)`;

  const backInternalHost = `$(PROJECT_NAME)_${backServiceName}`;
  const mapStorageInternalHost = `$(PROJECT_NAME)_${mapStorageServiceName}`;
  const redisInternalHost = `$(PROJECT_NAME)_${redisServiceName}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `thecodingmachine/workadventure-play:${input.workadventureVersion}`,
      },
      domains: [
        { host: "$(EASYPANEL_DOMAIN)", port: 3000, path: "/" },
        { host: "$(EASYPANEL_DOMAIN)", port: 3001, path: "/ws/" },
      ],
      env: [
        `DEBUG_MODE=false`,
        `JITSI_URL=meet.jit.si`,
        `JITSI_PRIVATE_MODE=false`,
        `ENABLE_MAP_EDITOR=true`,
        `MAP_EDITOR_ALLOW_ALL_USERS=true`,
        `PUSHER_URL=${playPublicUrl}/`,
        `ICON_URL=${iconPublicUrl}`,
        `DISABLE_NOTIFICATIONS=false`,
        `SKIP_RENDER_OPTIMIZATIONS=false`,
        `DISABLE_ANONYMOUS=false`,
        `SECRET_KEY=${secretKey}`,
        `API_URL=${backInternalHost}:50051`,
        `PUBLIC_MAP_STORAGE_URL=${mapStoragePublicUrl}`,
        `INTERNAL_MAP_STORAGE_URL=http://${mapStorageInternalHost}:3000`,
        `REDIS_HOST=${redisInternalHost}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `START_ROOM_URL=${
          input.startRoomUrl ||
          "/_/global/workadventure.github.io/map-starter-kit/office.tmj"
        }`,
        `ENABLE_CHAT=true`,
        `ENABLE_CHAT_UPLOAD=true`,
        `ENABLE_CHAT_ONLINE_LIST=true`,
        `ENABLE_CHAT_DISCONNECTED_LIST=true`,
        `ENABLE_TUTORIAL=true`,
        `UPLOADER_URL=${uploaderPublicUrl}`,
        `ENABLE_OPENAPI_ENDPOINT=true`,
        `ROOM_API_PORT=50051`,
        `ROOM_API_SECRET_KEY=${roomApiSecretKey}`,
        `MAP_STORAGE_API_TOKEN=${mapStorageApiToken}`,
        `MINIMUM_DISTANCE=64`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: backServiceName,
      source: {
        type: "image",
        image: `thecodingmachine/workadventure-back:${input.workadventureVersion}`,
      },
      env: [
        `PLAY_URL=${playPublicUrl}`,
        `MINIMUM_DISTANCE=64`,
        `GROUP_RADIUS=48`,
        `SECRET_KEY=${secretKey}`,
        `REDIS_HOST=${redisInternalHost}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `MAP_STORAGE_URL=${mapStorageInternalHost}:50053`,
        `INTERNAL_MAP_STORAGE_URL=http://${mapStorageInternalHost}:3000`,
        `PUBLIC_MAP_STORAGE_URL=${mapStoragePublicUrl}`,
        `ENABLE_MAP_EDITOR=true`,
        `ENABLE_CHAT=true`,
        `ENABLE_CHAT_UPLOAD=true`,
        `STORE_VARIABLES_FOR_LOCAL_MAPS=true`,
        `PLAYER_VARIABLES_MAX_TTL=-1`,
        `JITSI_URL=meet.jit.si`,
        `JITSI_PRIVATE_MODE=false`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: uploaderServiceName,
      source: {
        type: "image",
        image: `thecodingmachine/workadventure-uploader:${input.workadventureVersion}`,
      },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],
      env: [
        `UPLOADER_URL=${uploaderPublicUrl}`,
        `REDIS_HOST=${redisInternalHost}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `ENABLE_CHAT_UPLOAD=true`,
        `UPLOAD_MAX_FILESIZE=10485760`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: mapStorageServiceName,
      source: {
        type: "image",
        image: `thecodingmachine/workadventure-map-storage:${input.workadventureVersion}`,
      },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      mounts: [{ type: "volume", name: "maps", mountPath: "/maps" }],
      env: [
        `API_URL=${backInternalHost}:50051`,
        `SECRET_KEY=${secretKey}`,
        `MAP_STORAGE_API_TOKEN=${mapStorageApiToken}`,
        `PATH_PREFIX=`,
        `PUSHER_URL=${playPublicUrl}`,
        `ENABLE_BASIC_AUTHENTICATION=true`,
        `AUTHENTICATION_USER=admin`,
        `AUTHENTICATION_PASSWORD=${mapStorageAuthPassword}`,
        `ENTITY_COLLECTION_URLS=${playPublicUrl}/collections/FurnitureCollection.json,${playPublicUrl}/collections/OfficeCollection.json`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: iconServiceName,
      source: {
        type: "image",
        image: "matthiasluedtke/iconserver:v3.21.0",
      },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: redisServiceName, password: redisPassword },
  });

  return { services };
}
