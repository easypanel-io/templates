import { randomBytes } from "crypto";
import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

const PluginConfigs = {
  adminPlugin: {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      path: "/backoffice",
    },
  },
  paymentStripe: {
    resolve: "medusa-payment-stripe",
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
  paymentPaypal: {
    resolve: `medusa-payment-paypal`,
    options: {
      sandbox: process.env.PAYPAL_SANDBOX,
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      authWebhookId: process.env.PAYPAL_AUTH_WEBHOOK_ID,
    },
  },
  // https://docs.medusajs.com/plugins/file-service/minio
  // yarn add medusa-file-minio
  fileMinio: {
    resolve: "medusa-file-minio",
    options: {
      endpoint: process.env.MINIO_ENDPOINT,
      bucket: process.env.MINIO_BUCKET,
      access_key_id: process.env.MINIO_ACCESS_KEY,
      secret_access_key: process.env.MINIO_SECRET_KEY,
    },
  },
  // https://docs.medusajs.com/plugins/file-service/s3
  // yarn add medusa-file-s3
  fileS3: {
    resolve: "medusa-file-s3",
    options: {
      s3_url: process.env.S3_URL,
      bucket: process.env.S3_BUCKET,
      aws_config_object: {
        customUserAgent: process.env.S3_CUSTOM_AGENT,
      },
      region: process.env.S3_REGION,
      access_key_id: process.env.S3_ACCESS_KEY_ID,
      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    },
  },
  // yarn add medusa-plugin-meilisearch
  pluginMeilisearch: {
    resolve: `medusa-plugin-meilisearch`,
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description", "variant_sku"],
            displayedAttributes: [
              "id",
              "title",
              "description",
              "variant_sku",
              "thumbnail",
              "handle",
            ],
          },
          primaryKey: "id",
        },
      },
    },
  },
  // yarn add medusa-plugin-sendgrid
  // https://docs.medusajs.com/plugins/notifications/sendgrid
  pluginSendGrid: {
    resolve: "medusa-plugin-sendgrid",
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID,
      medusa_restock_template: process.env.SENDGRID_MEDUSA_RESTOCK_TEMPLATE,
      user_password_reset_template:
        process.env.SENDGRID_USER_PASSWORD_RESET_TEMPLATE,
      customer_password_reset_template:
        process.env.SENDGRID_CUSTOMER_PASSWORD_RESET_TEMPLATE,
      gift_card_created_template:
        process.env.SENDGRID_GIFT_CARD_CREATED_TEMPLATE,
      swap_received_template: process.env.SENDGRID_SWAP_RECEIVED_TEMPLATE,
      swap_shipment_created_template:
        process.env.SENDGRID_SWAP_SHIPMENT_CREATED_TEMPLATE,
      swap_created_template: process.env.SENDGRID_SWAP_CREATED_TEMPLATE,
      claim_shipment_created_template:
        process.env.SENDGRID_CLAIM_SHIPMENT_CREATED_TEMPLATE,
      order_items_returned_template:
        process.env.SENDGRID_ORDER_ITEMS_RETURNED_TEMPLATE,
      order_return_requested_template:
        process.env.SENDGRID_ORDER_RETURN_REQUESTED_TEMPLATE,
      order_shipped_template: process.env.SENDGRID_ORDER_SHIPPED_TEMPLATE,
      order_canceled_template: process.env.SENDGRID_ORDER_CANCELED_TEMPLATE,
      localization: {
        "en-EN": {
          // locale key
          order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID_LOCALIZED,
        },
      },
    },
  },
};

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const randomJwtSecret = randomPassword();
  const randomCookieSecret = randomPassword();
  const medusaConfig = [
    `const dotenv = require("dotenv");

    let ENV_FILE_NAME = ".env";

    try {
      dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
    } catch (e) {}

    const ADMIN_CORS =
      process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

    const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

    const DATABASE_URL =
      process.env.DATABASE_URL || "postgres://localhost/medusa-store";

    const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    `,
    `const plugins = [
      'medusa-fulfillment-manual',
      'medusa-payment-manual',
    `,
    input.stripeApiKey
      ? "// " + JSON.stringify(PluginConfigs.paymentStripe) + ","
      : "",
    input.enableAdminPlugin
      ? "// " + JSON.stringify(PluginConfigs.adminPlugin) + ","
      : "",
    input.meiliPluginEnabled
      ? "// " + JSON.stringify(PluginConfigs.pluginMeilisearch) + ","
      : "",
    input.minioPluginEnabled
      ? "// " + JSON.stringify(PluginConfigs.fileMinio) + ","
      : "",
    input.s3PluginEnabled ? JSON.stringify(PluginConfigs.fileS3) + "," : "",
    input.sendgridPluginEnabled
      ? "// " + JSON.stringify(PluginConfigs.pluginSendGrid) + ","
      : "",
    `
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
      ${input.redisServiceName ? "redis_url: REDIS_URL" : ""}
    };
    /** @type {import('@medusajs/medusa').ConfigModule} */
    module.exports = {
      projectConfig,
      plugins,
      modules,
    };
  `,
  ];
  // Frontend service variables
  let frontendServiceVariables = [];
  // Backend service variables
  let appServiceVariables = [
    // Nixpacks builder config
    "NIXPACKS_NODE_VERSION=20",
    "NIXPACKS_NX_APP_NAME=admin",
    // Medusa variables
    `ADMIN_CORS=${input.adminCors}`,
    `LOG_LEVEL=${input.logLevel}`,
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
    `PAYPAL_SANDBOX=${input.paypalSandbox}`,
    `PAYPAL_CLIENT_ID=${input.paypalClientId}`,
    `PAYPAL_CLIENT_SECRET=${input.paypalClientSecret}`,
    `PAYPAL_AUTH_WEBHOOK_ID=${input.paypalAuthWebhookId}`,
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
    `MINIO_ROOT_USER=${input.minioRootUser}`,
    `MINIO_ROOT_PASSWORD=${input.minioRootPassword}`,
    `MINIO_VOLUMES=${input.minioVolumeName || "/mnt/data"}`,
    `MINIO_SERVER_URL=${input.minioServerUrl}`,
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

    if (input.enableStorefront) {
      const _StorefrontVariables = [
        `NIXPACKS_INSTALL_CMD=${input.featureSearchEnabled || "yarn"}`,
        `NIXPACKS_BUILD_CMD=${input.featureSearchEnabled || "yarn build"}`,
        `NIXPACKS_START_CMD=${input.featureSearchEnabled || "yarn start"}`,
        `NIXPACKS_NODE_VERSION=${input.featureSearchEnabled || "18"}`,
        `NEXT_PUBLIC_MEDUSA_BACKEND_URL=${
          input.nextPublicMedusaBackendUrl || ""
        }`,
        `FEATURE_SEARCH_ENABLED=${input.featureSearchEnabled || ""}`,
        `NEXT_PUBLIC_BASE_URL=${input.nextPublicBaseUrl || ""}`,
        `POSTGRES_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NEXT_PUBLIC_STRIPE_KEY=${input.nextPublicStripeKey || ""}`,
        `NEXT_PUBLIC_PAYPAL_CLIENT_ID=${input.nextPublicPaypalClientId || ""}`,
        `NEXT_PUBLIC_SEARCH_APP_ID=${input.nextPublicSearchAppId || ""}`,
        `NEXT_PUBLIC_SEARCH_ENDPOINT=${input.nextPublicSearchEndpoint || ""}`,
        `NEXT_PUBLIC_SEARCH_API_KEY=${input.nextPublicSearchApiKey || ""}`,
        `NEXT_PUBLIC_INDEX_NAME=${input.nextPublicIndexName || ""}`,
        `REVALIDATE_SECRET=${input.revalidateSecret || ""}`,
      ];
      frontendServiceVariables.push(_StorefrontVariables.join("\n"));
    }
  }

  // Medusa deploy command based in environment
  const medusaDeployCommand = [];
  const medusa = "/app/node_modules/.bin/medusa";

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
      serviceName: input.backendServiceName || "medusa",
      source: {
        type: "github",
        owner: "beakman",
        repo: "natahome",
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
        {
          host: input.medusaDomain || "api.example.com",
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
          content: medusaConfig.join("\n"),
          mountPath: "/app/medusa-config.js",
        },
      ],
    },
  });

  // # Your Medusa backend, should be updated to where you are hosting your server. Remember to update CORS settings for your server. See – https://docs.medusajs.com/usage/configurations#storefront-cors
  // NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.natahome.com

  // # Your store URL, should be updated to where you are hosting your storefront.
  // NEXT_PUBLIC_BASE_URL=http://localhost:8000

  // # Posgres URL for your Medusa DB for the Product Module. See - https://docs.medusajs.com/modules/products/serverless-module
  // POSTGRES_URL=postgres://postgres:postgres@localhost:5432/medusa

  // # Your Stripe public key. See – https://docs.medusajs.com/add-plugins/stripe
  // NEXT_PUBLIC_STRIPE_KEY=

  // # Your PayPal Client ID. See – https://docs.medusajs.com/add-plugins/paypal
  // NEXT_PUBLIC_PAYPAL_CLIENT_ID=

  // # Your MeiliSearch / Algolia keys. See – https://docs.medusajs.com/add-plugins/meilisearch or https://docs.medusajs.com/add-plugins/algolia
  // NEXT_PUBLIC_SEARCH_APP_ID=
  // NEXT_PUBLIC_SEARCH_ENDPOINT=https://search.natahome.com
  // NEXT_PUBLIC_SEARCH_API_KEY=
  // NEXT_PUBLIC_INDEX_NAME=products

  // # Your Next.js revalidation secret. See – https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation
  // REVALIDATE_SECRET=supersecret

  const storefrontConfig = {
    features: {
      search: true,
    },
  };
  const envFileContent = [];
  envFileContent.push(
    `NEXT_PUBLIC_MEDUSA_BACKEND_URL=${input.nextPublicMedusaBackendUrl}`
  );
  envFileContent.push(`NEXT_PUBLIC_BASE_URL=${input.nextPublicBaseUrl}`);
  envFileContent.push(`NEXT_PUBLIC_BASE_URL=${input.nextPublicBaseUrl}`);
  envFileContent.push(`NEXT_PUBLIC_BASE_URL=${input.nextPublicBaseUrl}`);
  envFileContent.push(`POSTGRES_URL=${input}`);
  envFileContent.push(`NEXT_PUBLIC_BASE_URL=${input.nextPublicBaseUrl}`);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.frontendServiceName || "medusa-storefront",
      source: {
        type: "github",
        owner: "beakman",
        repo: "natahome-store",
        ref: "main",
        path: "/",
        autoDeploy: true,
      },
      build: {
        type: "nixpacks",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
        {
          host: input.storefrontDomain || "example.com",
          port: 8000,
        },
      ],
      env: frontendServiceVariables.join("\n"),
      deploy: {
        command: "yarn start",
      },
      mounts: [
        {
          type: "file",
          content: JSON.stringify(storefrontConfig, null, " "),
          mountPath: "/app/store-config.js",
        },
        {
          type: "file",
          content: JSON.stringify(storefrontConfig, null, " "),
          mountPath: "/app/.env",
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
          {
            host: input.minioDomain || "minio.example.com",
            port: 9000,
          },
          {
            host: input.minioConsoleDomain || "minio-console.example.com",
            port: 9001,
          },
        ],
        env: minioServiceVariables.join("\n"),
        mounts: [
          {
            type: "volume",
            name: input.minioVolumeName || "minio",
            mountPath: "/mnt/data",
          },
        ],
        deploy: {
          command: 'minio server --console-address ":9001"',
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
          {
            host: input.searchDomain || "search.example.com",
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
