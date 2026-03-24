import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(64);
  const cronSecret = randomString(32);
  const dockerfile = `
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
RUN git clone --filter=blob:none https://github.com/mddanishyusuf/traffic-source.git /app \
  && cd /app \
  && git checkout 57046909855c3dec7ef9a077ea03e64d681ae92d
RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/instrumentation.js ./instrumentation.js
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/jsconfig.json ./jsconfig.json
EXPOSE 3000
CMD ["npm", "start"]
`.trim();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "dockerfile",
        dockerfile,
      },
      env: [
        `JWT_SECRET=${jwtSecret}`,
        `JWT_EXPIRY=${input.jwtExpiry || "7d"}`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_PATH=/app/data/analytics.db`,
        `CRON_SECRET=${cronSecret}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
