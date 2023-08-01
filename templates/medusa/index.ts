import { randomBytes } from "crypto";
import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const randomJwtSecret = randomPassword();
  const randomCookieSecret = randomPassword();
  const medusaConfig = `const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-store";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  'medusa-fulfillment-manual',
  'medusa-payment-manual',
  {
    resolve: '@medusajs/file-local',
    options: {
      upload_dir: "uploads",
    },
  },
  // To enable the admin plugin, uncomment the following lines and run 'yarn add @medusajs/admin'
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
    },
  },
];

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};`;

  // Service variables
  let appServiceVariables = [
    "NIXPACKS_NODE_VERSION=18",
    `ADMIN_CORS=${input.adminCors}`,
    `COOKIE_SECRET=${input.cookieSecret || randomCookieSecret}`,
    `DATABASE_TYPE=postgres`,
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `JWT_SECRET=${input.jwtSecret || randomJwtSecret}`,
    `NODE_ENV=${input.nodeEnv}`,
    `PORT=${input.medusaPort || "9000"}`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
    `STORE_CORS=${input.storefrontCors}`,
    `STRIPE_API_KEY=${input.stripeApiKey}`,
    `STRIPE_WEBHOOK_SECRET=${input.stripeWebhookSecret}`,
    `MEDUSA_FF_ORDER_EDITING=${input.featureFlagOrderEditing}`,
    `MEDUSA_FF_PRODUCT_CATEGORIES=${input.featureFlagProductCategories}`,
    `MEDUSA_FF_SALES_CHANNELS=${input.featureFlagSaleChannels}`,
    `MEDUSA_FF_TAX_INCLUSIVE_PRICING=${input.featureFlagTaxInclusivePricing}`,
  ];

  if (input.meiliPluginEnabled) {
    const _meiliSearchVariables = [
      `MEILISEARCH_HOST=http://$(PROJECT_NAME)_${input.meiliServiceName}:7700`,
      "MEILISEARCH_API_KEY=",
    ];
    appServiceVariables.push(_meiliSearchVariables.join("\n"));
  }

  let melisearchServiceVariables = [
    `MEILI_ENV=${input.meiliEnv}`,
    input.meiliEnv == "production" &&
      `MEILI_MASTER_KEY=${
        input.meiliMasterKey || randomBytes(24).toString("hex")
      }`,
    "MEILI_NO_ANALYTICS=true",
    "MEILI_SCHEDULE_SNAPSHOT=86400",
  ];

  if (input.minioPluginEnabled) {
    const _minioVariables = [
      `MINIO_ENDPOINT=http://$(PROJECT_NAME)_${input.minioServiceName}:9000`,
      "MINIO_BUCKET=",
      "MINIO_ACCESS_KEY=",
      "MINIO_SECRET_KEY=",
    ];
    appServiceVariables.push(_minioVariables.join("\n"));
  }

  let minioServiceVariables = [
    `MINIO_ROOT_USER=${input.minioRootUser || ""}`,
    `MINIO_ROOT_PASSWORD=${input.minioRootPassword || ""}`,
  ];

  if (input.s3PluginEnabled) {
    const _s3Variables = [
      "S3_URL=",
      "S3_BUCKET=",
      "S3_REGION=",
      "S3_ACCESS_KEY_ID=",
      "S3_SECRET_ACCESS_KEY=",
    ];
    appServiceVariables.push(_s3Variables.join("\n"));
  }

  if (input.sendgridPluginEnabled) {
    const _sendGridVariables = [
      `SENDGRID_API_KEY=${input.sendGridApiKey}`,
      `SENDGRID_FROM=${input.sendGridFrom}`,
      "SENDGRID_ORDER_PLACED_ID=",
      "SENDGRID_MEDUSA_RESTOCK_TEMPLATE=",
      "SENDGRID_USER_PASSWORD_RESET_TEMPLATE=",
      "SENDGRID_CUSTOMER_PASSWORD_RESET_TEMPLATE=",
      "SENDGRID_GIFT_CARD_CREATED_TEMPLATE=",
      "SENDGRID_SWAP_RECEIVED_TEMPLATE=",
      "SENDGRID_SWAP_SHIPMENT_CREATED_TEMPLATE=",
      "SENDGRID_SWAP_CREATED_TEMPLATE=",
      "SENDGRID_CLAIM_SHIPMENT_CREATED_TEMPLATE=",
      "SENDGRID_ORDER_ITEMS_RETURNED_TEMPLATE=",
      "SENDGRID_ORDER_RETURN_REQUESTED_TEMPLATE=",
      "SENDGRID_ORDER_SHIPPED_TEMPLATE=",
      "SENDGRID_ORDER_CANCELED_TEMPLATE=",
      "SENDGRID_ORDER_PLACED_ID_LOCALIZED=",
    ];
    appServiceVariables.push(_sendGridVariables.join("\n"));
  }

  // Medusa deploy command based in environment
  const medusaDeployCommand = [];
  const medusa = "/app/node_modules/.bin/medusa";

  // Install selected plugins
  input.minioPluginEnabled &&
    medusaDeployCommand.push("yarn add medusa-file-minio");
  input.meiliPluginEnabled &&
    medusaDeployCommand.push("yarn add medusa-plugin-meilisearch");
  input.s3PluginEnabled && medusaDeployCommand.push("yarn add medusa-file-s3");
  input.sendgridPluginEnabled &&
    medusaDeployCommand.push("yarn add medusa-plugin-sendgrid");
  input.stripePluginEnabled &&
    medusaDeployCommand.push("yarn add medusa-payment-stripe");

  if (input.nodeEnv == "development") {
    medusaDeployCommand.push(`${medusa} migrations run`);
    medusaDeployCommand.push("yarn dev");
  } else {
    medusaDeployCommand.push(`${medusa} migrations run`);
    // Create user admin
    input.enableAdminPlugin &&
      medusaDeployCommand.push(
        `${medusa} user -e ${input.medusaAdminUsername} -p ${input.medusaAdminPassword}`
      );
    medusaDeployCommand.push(`${medusa} start`);
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName || "medusa",
      source: {
        type: "github",
        owner: "medusajs",
        repo: "medusa-starter-default",
        ref: "master",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "nixpacks",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      env: appServiceVariables.join("\n"),
      deploy: {
        command: medusaDeployCommand.join(" && "),
      },
      mounts: [
        { type: "volume", name: "app", mountPath: "/usr/src/app" },
        {
          type: "file",
          content: medusaConfig,
          mountPath: "/app/medusa-config.js",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName || "medusa-db",
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName || "medusa-redis",
      password: redisPassword,
    },
  });

  input.minioPluginEnabled &&
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.minioServiceName || "medusa-storage",
        source: {
          type: "image",
          image: input.minioServiceImage || "minio/minio:latest",
        },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 9001,
          },
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 9000,
          },
        ],
        env: minioServiceVariables.join("\n"),
        mounts: [
          {
            type: "volume",
            name: input.minioVolumeName || "minio",
            mountPath: "/data",
          },
        ],
        deploy: {
          command: "/opt/bin/minio server /data --console-address :9001",
        },
      },
    });

  input.meiliPluginEnabled &&
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.meiliServiceName || "medusa-search",
        source: {
          type: "image",
          image: input.meiliServiceImage || "getmeili/meilisearch:latest",
        },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 7700,
          },
        ],
        env: melisearchServiceVariables.join("\n"),
        mounts: [
          {
            type: "volume",
            name: input.meiliVolumeName || "meilisearch",
            mountPath: "/meili_data",
          },
        ],
      },
    });

  return { services };
}
