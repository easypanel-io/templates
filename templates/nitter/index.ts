import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const redisServiceName = `${input.appServiceName}-redis`;
  const redisPassword = randomPassword();
  const hmacKey = randomBytes(32).toString("hex");

  const nitterConf = `[Server]
hostname = "$(PRIMARY_DOMAIN)"
title = "${input.siteTitle}"
address = "0.0.0.0"
port = 8080
https = true
httpMaxConnections = 100
staticDir = "./public"

[Cache]
listMinutes = 240
rssMinutes = 10
redisHost = "$(PROJECT_NAME)-${redisServiceName}"
redisPort = 6379
redisPassword = "${redisPassword}"
redisConnections = 20
redisMaxConnections = 30

[Config]
hmacKey = "${hmacKey}"
base64Media = false
enableRSS = true
enableRSSUserTweets = true
enableRSSUserReplies = true
enableRSSUserMedia = true
enableRSSUserArticles = true
enableRSSSearch = true
enableRSSList = true
enableDebug = false
proxy = ""
proxyAuth = ""
apiProxy = ""
disableTid = false
maxConcurrentReqs = 2
maxRetries = 1
retryDelayMs = 150

[Preferences]
theme = "${input.theme}"
replaceTwitter = "$(PRIMARY_DOMAIN)"
replaceYouTube = "piped.video"
replaceReddit = "teddit.net"
proxyVideos = ${input.proxyVideos ? "true" : "false"}
hlsPlayback = false
infiniteScroll = ${input.infiniteScroll ? "true" : "false"}
`;

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

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
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: nitterConf,
          mountPath: "/src/nitter.conf",
        },
        {
          type: "file",
          content: input.sessionsJsonl,
          mountPath: "/src/sessions.jsonl",
        },
      ],
    },
  });

  return { services };
}
