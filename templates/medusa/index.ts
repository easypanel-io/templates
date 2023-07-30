import { randomBytes } from "crypto";
import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";
import { PluginConfigs } from "./plugins-config";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const randomJwtSecret = randomPassword();
  const randomCookieSecret = randomPassword();
  const medusaConfig = require("./medusa-config");

  // Service variables
  let appServiceVariables = [
    // Nixpacks builder config
    "NIXPACKS_NODE_VERSION=18",
    "NIXPACKS_NX_APP_NAME=admin",
    // Medusa variables
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
    // Feature flags https://docs.medusajs.com/development/feature-flags/overview
    `MEDUSA_FF_ORDER_EDITING=${input.featureFlagOrderEditing}`,
    `MEDUSA_FF_PRODUCT_CATEGORIES=${input.featureFlagProductCategories}`,
    `MEDUSA_FF_SALES_CHANNELS=${input.featureFlagSaleChannels}`,
    `MEDUSA_FF_TAX_INCLUSIVE_PRICING=${input.featureFlagTaxInclusivePricing}`,
  ];

  if (input.meiliPluginEnabled) {
    const _meiliSearchVariables = [
      `MEILISEARCH_HOST=http://$(PROJECT_NAME)_${input.meiliServiceName}:7700`,
      `MEILISEARCH_API_KEY=${input.meiliApiKey || ""}`,
    ];
    appServiceVariables.push(_meiliSearchVariables.join("\n"));
  }

  let melisearchServiceVariables = [
    `MEILI_ENV=${input.meiliEnv}`,
    input.meiliEnv == "production" &&
      `MEILI_MASTER_KEY=${
        input.meiliMasterKey || randomBytes(18).toString("hex")
      }`,
  ];

  if (input.meiliNoAnalytics) {
    melisearchServiceVariables.push("MEILI_NO_ANALYTICS=true");
  }

  if (input.meiliScheduleSnapshot) {
    melisearchServiceVariables.push(
      `MEILI_SCHEDULE_SNAPSHOT=${
        input.meiliSnapshotInterval ? input.meiliSnapshotInterval : "true"
      }`
    );
  }

  if (input.minioPluginEnabled) {
    const _minioVariables = [
      `MINIO_ENDPOINT=${input.minioEndpoint || ""}`,
      `MINIO_BUCKET=${input.minioBucket || ""}`,
      `MINIO_ACCESS_KEY=${input.minioAccessKey || ""}`,
      `MINIO_SECRET_KEY=${input.minioSecretKey || ""}`,
    ];
    appServiceVariables.push(_minioVariables.join("\n"));
  }

  let minioServiceVariables = [
    `MINIO_ROOT_USER=${input.minioRootUser || ""}`,
    `MINIO_ROOT_PASSWORD=${input.minioRootPassword || ""}`,
  ];

  if (input.s3PluginEnabled) {
    const _s3Variables = [
      `S3_URL=${input.s3Url || ""}`,
      `S3_BUCKET=${input.s3Bucket || ""}`,
      `S3_REGION=${input.s3Region || ""}`,
      `S3_ACCESS_KEY_ID=${input.s3AccessKey || ""}`,
      `S3_SECRET_ACCESS_KEY=${input.s3SecretKey || ""}`,
    ];
    appServiceVariables.push(_s3Variables.join("\n"));
  }

  if (input.sendgridPluginEnabled) {
    const _sendGridVariables = [
      `SENDGRID_API_KEY=${input.sendGridApiKey}`,
      `SENDGRID_FROM=${input.sendGridFrom}`,
      `SENDGRID_ORDER_PLACED_ID=${input.sendGridOrderPlacedId}`,
      `SENDGRID_MEDUSA_RESTOCK_TEMPLATE=${input.sendGridMedusaRestockTemplate}`,
      `SENDGRID_USER_PASSWORD_RESET_TEMPLATE=${input.sendGridUserPasswordResetTemplate}`,
      `SENDGRID_CUSTOMER_PASSWORD_RESET_TEMPLATE=${input.sendGridCustomerPasswordResetTemplate}`,
      `SENDGRID_GIFT_CARD_CREATED_TEMPLATE=${input.sendGridGiftCardCreatedTemplate}`,
      `SENDGRID_SWAP_RECEIVED_TEMPLATE=${input.sendGridSwapReceivedTemplate}`,
      `SENDGRID_SWAP_SHIPMENT_CREATED_TEMPLATE=${input.sendGridSwapShipmentCreatedTemplate}`,
      `SENDGRID_SWAP_CREATED_TEMPLATE=${input.sendGridSwapCreatedTemplate}`,
      `SENDGRID_CLAIM_SHIPMENT_CREATED_TEMPLATE=${input.sendGridClaimShipmentCreatedTemplate}`,
      `SENDGRID_ORDER_ITEMS_RETURNED_TEMPLATE=${input.sendGridOrderItemsReturnedTemplate}`,
      `SENDGRID_ORDER_RETURN_REQUESTED_TEMPLATE=${input.sendGridOrderReturnRequestedTemplate}`,
      `SENDGRID_ORDER_SHIPPED_TEMPLATE=${input.sendGridOrderShippedTemplate}`,
      `SENDGRID_ORDER_CANCELED_TEMPLATE=${input.sendGridOrderCanceledTemplate}`,
      `SENDGRID_ORDER_PLACED_ID_LOCALIZED=${input.sendGridOrderPlacedIdLocalized}`,
    ];
    appServiceVariables.push(_sendGridVariables.join("\n"));
  }

  // Medusa deploy command based in environment
  const medusaDeployCommand = [];
  const medusa = "./app/node_modules/.bin/medusa";

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

  if (input.enableAdminPlugin)
    medusaConfig.plugins.push(PluginConfigs.adminPlugin);

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
          content: JSON.stringify(medusaConfig),
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

  // Activate Medusa plugins based in configurations
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
