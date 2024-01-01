export const PluginConfigs = {
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
      // aws_config_object: {
      //  customUserAgent: process.env.S3_CUSTOM_AGENT,
      // },
      region: process.env.S3_REGION,
      access_key_id: process.env.S3_ACCESS_KEY_ID,
      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    },
  },
  // yarn add medusa-plugin-meilisearch
  pluginMeilisearch: {
    resolve: "medusa-plugin-meilisearch",
    options: {
      // other options...
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description", "variant_sku"],
            displayedAttributes: [
              "title",
              "description",
              "variant_sku",
              "thumbnail",
              "handle",
            ],
          },
          primaryKey: "id",
          transformer: (product) => ({
            id: product.id,
            // other attributes...
          }),
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
        "de-DE": {
          // locale key
          order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID_LOCALIZED,
        },
      },
    },
  },
};
