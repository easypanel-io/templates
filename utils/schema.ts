import { randomBytes } from "crypto";
import { z } from "zod";

export const randomPassword = () => randomBytes(10).toString("hex");

const emptyToUndefined = (value: any) => {
  if (typeof value !== "string") return value;
  return value.trim() === "" ? undefined : value;
};

export const projectNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );

export const databaseNameRule = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]{0,62}$/, "Invalid name.");

export const databaseUserRule = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]{0,62}$/, "Invalid name.");

const backupPrefixRule = z
  .string()
  .regex(
    /^[\w-/]*$/,
    "Invalid name. Use lowercase letters (a-z), uppercase letters (A-Z), digits (0-9), dash (-), slash (/), underscore (_)."
  );

export const serviceNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
const processNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
const volumeNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
export const domainRule = z.string().regex(/^[^\s*]+$/);
export const portRule = z.number().min(0).max(65535);
const passwordRule = z.preprocess(
  emptyToUndefined,
  z.string().default(randomPassword)
);

export const appMountsSchema = z
  .array(
    z.union([
      z.object({
        type: z.literal("bind"),
        hostPath: z.string().min(1),
        mountPath: z.string().min(1),
      }),
      z.object({
        type: z.literal("volume"),
        name: volumeNameRule,
        mountPath: z.string().min(1),
      }),
      z.object({
        type: z.literal("file"),
        content: z.string(),
        mountPath: z.string().min(1),
      }),
    ])
  )
  .default([]);

export const appDeploySchema = z
  .object({
    replicas: z.number().default(1),
    command: z.string().nullable().default(null),
    zeroDowntime: z.boolean().default(true),
    capAdd: z.array(z.string()).optional(),
    capDrop: z.array(z.string()).optional(),
    sysctls: z.record(z.string(), z.string()).optional(),
    groups: z.array(z.string()).optional(),
    tiniInit: z.boolean().optional(),
  })
  .default({});

export const appBasicAuthSchema = z
  .array(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .optional();

export const appRedirectsSchema = z
  .array(
    z.object({
      regex: z.string(),
      replacement: z.string(),
      permanent: z.boolean(),
      enabled: z.boolean(),
    })
  )
  .optional();

const appSourceSchema = z
  .union([
    z.object({
      type: z.literal("image"),
      image: z.string(),
      username: z.string().optional(),
      password: z.string().optional(),
    }),
    z.object({
      type: z.literal("github"),
      owner: z.string().min(1),
      repo: z.string().min(1),
      ref: z.string().min(1),
      path: z.string().regex(/^\//),
      autoDeploy: z.boolean(),
    }),
    z.object({
      type: z.literal("git"),
      repo: z.string().min(1),
      ref: z.string().min(1),
      path: z.string().regex(/^\//),
    }),
    z.object({
      type: z.literal("dockerfile"),
      dockerfile: z.string().min(1),
    }),
  ])
  .optional();

const composeSourceSchema = z
  .union([
    z.object({
      type: z.literal("inline"),
      content: z.string(),
    }),
    z.object({
      type: z.literal("git"),
      repo: z.string(),
      ref: z.string(),
      rootPath: z.string(),
      composeFile: z.string(),
    }),
  ])
  .optional();

export const composeRedirectsSchema = z
  .array(
    z.object({
      regex: z.string(),
      replacement: z.string(),
      permanent: z.boolean(),
      enabled: z.boolean(),
    })
  )
  .optional();

const composeBasicAuthSchema = z
  .array(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .optional();

export const appBuildSchema = z
  .union([
    z.object({
      type: z.literal("dockerfile"),
      file: z.string().optional(),
    }),
    z.object({
      type: z.literal("heroku-buildpacks"),
    }),
    z.object({
      type: z.literal("paketo-buildpacks"),
    }),
    z.object({
      type: z.literal("nixpacks"),
      installCommand: z.string().optional(),
      buildCommand: z.string().optional(),
      startCommand: z.string().optional(),
      nixPackages: z.string().optional(),
      aptPackages: z.string().optional(),
    }),
  ])
  .optional();

export const resourcesSchema = z
  .object({
    memoryReservation: z.number(),
    memoryLimit: z.number(),
    cpuReservation: z.number(),
    cpuLimit: z.number(),
  })
  .optional();

export const backupSchema = z
  .object({
    enabled: z.boolean(),
    schedule: z.string().min(1),
    destinationId: z.string().min(1),
    prefix: backupPrefixRule,
    databaseName: z.string().optional(),
  })
  .optional();

export const appPortsSchema = z
  .array(
    z.object({
      published: z.number(),
      target: z.number(),
      protocol: z.union([z.literal("tcp"), z.literal("udp")]).default("tcp"),
    })
  )
  .default([]);

export const domainsSchema = z
  .array(
    z.object({
      host: domainRule,
      https: z.boolean().default(true),
      port: z.number().default(80),
      path: z.string().startsWith("/").default("/"),
      middlewares: z.array(z.string()).optional(),
      certificateResolver: z.string().optional(),
      wildcard: z.boolean().default(false),
    })
  )
  .default([]);

export const composeDomainsSchema = z
  .array(
    z.object({
      https: z.boolean().default(true),
      host: domainRule,
      port: z.number().default(80),
      service: z.string().default(""),
      path: z.string().startsWith("/").default("/"),
      middlewares: z.array(z.string()).optional(),
      certificateResolver: z.string().optional(),
      wildcard: z.boolean().default(false),
    })
  )
  .default([]);

export const maintenanceSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    customLogo: z.string().optional(),
    customCss: z.string().optional(),
    hideLogo: z.boolean().optional(),
    hideLinks: z.boolean().optional(),
  })
  .optional();

export const boxProcessesSchema = z
  .array(
    z.object({
      name: processNameRule,
      command: z.string(),
      directory: z.string(),
      enabled: z.boolean(),
    })
  )
  .default([]);

export const boxScriptsSchema = z
  .array(
    z.object({
      name: z.string(),
      content: z.string(),
      webhookToken: z.string(),
      schedule: z.string().optional(),
      enabled: z.boolean(),
    })
  )
  .default([]);

export const boxGitSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
    branch: z.string().optional(),
  })
  .optional();

const nginxDefaultSite = `
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	root {{ document_root }};

	index index.php index.html;

	server_name _;

	location / {
		try_files $uri $uri/ =404;
	}

	location ~ \.php$ {
		include snippets/fastcgi-php.conf;
		fastcgi_pass {{ fpm_socket }};
	}
}
`.trim();

export const boxIdeSchema = z
  .object({
    defaultFolder: z.string().default("/code"),
    token: z.string().default(() => randomBytes(10).toString("hex")),
    enabled: z.boolean().default(true),
  })
  .optional();

export const boxAdvancedSchema = z
  .object({
    buildScript: z.string().default(""),
    startScript: z.string().default(""),
  })
  .optional();

export const boxPhpSchema = z
  .object({
    version: z.string().default("8.3"),
    maxUploadSize: z.string().default("128M"),
    maxExecutionTime: z.string().default("30"),
    opcache: z.boolean().default(true),
    phpIni: z.string().default(""),
    enabled: z.boolean().default(true),
    ioncube: z.boolean().default(false),
    sqlsrv: z.boolean().default(false),
  })
  .optional();

export const boxNodejsSchema = z
  .object({
    version: z.string().default("18"),
    yarn: z.boolean().default(false),
    pnpm: z.boolean().default(false),
    enabled: z.boolean().default(true),
  })
  .optional();

export const boxNginxSchema = z
  .object({
    rootDocument: z.string().default("/code"),
    config: z.string().default(nginxDefaultSite),
    enabled: z.boolean().default(true),
  })
  .optional();

export const boxPythonSchema = z
  .object({
    version: z.string().default("3"),
    enabled: z.boolean().default(false),
  })
  .optional();

export const boxRubySchema = z
  .object({
    version: z.string().default("2.6"),
    enabled: z.boolean().default(false),
  })
  .optional();

export const boxModulesSchema = z
  .object({
    ide: z.boolean().default(false),
    advanced: z.boolean().default(false),
    php: z.boolean().default(false),
    nodejs: z.boolean().default(false),
    nginx: z.boolean().default(false),
    python: z.boolean().default(false),
    ruby: z.boolean().default(false),
    deployments: z.boolean().default(false),
    git: z.boolean().default(false),
    domains: z.boolean().default(false),
    redirects: z.boolean().default(false),
    basicAuth: z.boolean().default(false),
    mounts: z.boolean().default(false),
    processes: z.boolean().default(false),
    scripts: z.boolean().default(false),
    ports: z.boolean().default(false),
    resources: z.boolean().default(false),
    env: z.boolean().default(false),
  })
  .default({});

export const boxDeploymentSchema = z
  .object({
    script: z.string().default(""),
    token: z.string().default(() => randomBytes(10).toString("hex")),
  })
  .default({});

export const boxMountsSchema = z
  .array(
    z.union([
      z.object({
        type: z.literal("bind"),
        hostPath: z.string(),
        mountPath: z.string(),
      }),
      z.object({
        type: z.literal("volume"),
        name: z.string(),
        mountPath: z.string(),
      }),
      z.object({
        type: z.literal("file"),
        content: z.string(),
        mountPath: z.string(),
      }),
    ])
  )
  .default([]);

export const boxRedirectsSchema = z
  .array(
    z.object({
      regex: z.string(),
      replacement: z.string(),
      permanent: z.boolean(),
      enabled: z.boolean(),
    })
  )
  .default([]);

export const boxBasicAuthSchema = z
  .array(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .default([]);

export const boxPortsSchema = z
  .array(
    z.object({
      published: z.number(),
      target: z.number(),
      protocol: z.union([z.literal("tcp"), z.literal("udp")]).default("tcp"),
    })
  )
  .default([]);

export const boxEnvSchema = z
  .object({
    content: z.string().default(""),
  })
  .optional();

export const boxSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  codeInitialized: z.boolean().default(false),
  deployment: boxDeploymentSchema,
  git: boxGitSchema,
  domains: z
    .array(
      z.object({
        host: z.string(),
        https: z.boolean(),
        port: z.number(),
        path: z.string(),
        middlewares: z.array(z.string()).optional(),
      })
    )
    .default([]),
  redirects: boxRedirectsSchema,
  basicAuth: boxBasicAuthSchema,
  mounts: boxMountsSchema,
  processes: boxProcessesSchema,
  scripts: boxScriptsSchema,
  ports: boxPortsSchema,
  resources: resourcesSchema,
  modules: boxModulesSchema,
  ide: boxIdeSchema,
  advanced: boxAdvancedSchema,
  php: boxPhpSchema,
  nodejs: boxNodejsSchema,
  nginx: boxNginxSchema,
  python: boxPythonSchema,
  ruby: boxRubySchema,
  env: boxEnvSchema,
});

export const wordpressGitSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
    branch: z.string().optional(),
  })
  .optional();

export const wordpressRedirectsSchema = z
  .array(
    z.object({
      regex: z.string(),
      replacement: z.string(),
      permanent: z.boolean(),
      enabled: z.boolean(),
    })
  )
  .default([]);

export const wordpressBasicAuthSchema = z
  .array(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .default([]);

export const wordpressEnvSchema = z
  .object({
    content: z.string().default(""),
  })
  .optional();

export const wordpressScriptsSchema = z
  .array(
    z.object({
      name: z.string(),
      content: z.string(),
      webhookToken: z.string(),
      schedule: z.string().optional(),
      enabled: z.boolean(),
    })
  )
  .default([]);

export const wordpressIdeSchema = z
  .object({
    enabled: z.boolean().default(true),
    defaultFolder: z.string().default("/code"),
    token: z.string().default(() => randomBytes(10).toString("hex")),
  })
  .optional();

export const wordpressPhpSchema = z
  .object({
    version: z.string().default("8.3"),
    maxUploadSize: z.string().default("128M"),
    maxExecutionTime: z.string().default("30"),
    opcache: z.boolean().default(true),
    phpIni: z.string().default(""),
    ioncube: z.boolean().default(false),
    sqlsrv: z.boolean().default(false),
  })
  .optional();

export const wordpressNginxSchema = z
  .object({
    rootDocument: z.string().default("/code"),
    config: z.string().default(nginxDefaultSite),
  })
  .optional();

export const wordpressDomainSchema = z.object({
  host: z.string(),
  https: z.boolean(),
  port: z.number(),
  path: z.string(),
  middlewares: z.array(z.string()).optional(),
  certificateResolver: z.string().optional(),
});

export const wordpressSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  codeInitialized: z.boolean().default(false),
  initialVersion: z.string().default("latest"),
  git: wordpressGitSchema,
  domain: wordpressDomainSchema,
  redirects: wordpressRedirectsSchema,
  basicAuth: wordpressBasicAuthSchema,
  scripts: wordpressScriptsSchema,
  resources: resourcesSchema,
  ide: wordpressIdeSchema,
  php: wordpressPhpSchema,
  nginx: wordpressNginxSchema,
  env: wordpressEnvSchema,
});

export const appSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  source: appSourceSchema,
  build: appBuildSchema,
  env: z.string().default(""),
  basicAuth: appBasicAuthSchema,
  deploy: appDeploySchema,
  domains: domainsSchema,
  mounts: appMountsSchema,
  ports: appPortsSchema,
  resources: resourcesSchema,
  maintenance: maintenanceSchema,
});

export const composeSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  source: composeSourceSchema,
  env: z.string().default(""),
  createDotEnv: z.boolean().default(false),
  domains: composeDomainsSchema,
  redirects: composeRedirectsSchema,
  basicAuth: composeBasicAuthSchema,
  maintenance: maintenanceSchema,
});

export const mongoSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  user: databaseUserRule.optional(),
  image: z.preprocess(emptyToUndefined, z.string().default("mongo:8")),
  password: passwordRule,
  resources: resourcesSchema,
  env: z.string().optional(),
  command: z.string().optional(),
});

export const mysqlSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  databaseName: databaseNameRule.optional(),
  user: databaseUserRule.optional(),
  image: z.preprocess(emptyToUndefined, z.string().default("mysql:9")),
  password: passwordRule,
  rootPassword: passwordRule,
  resources: resourcesSchema,
  env: z.string().optional(),
  command: z.string().optional(),
});

export const mariadbSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  databaseName: databaseNameRule.optional(),
  user: databaseUserRule.optional(),
  image: z.preprocess(emptyToUndefined, z.string().default("mariadb:11")),
  password: passwordRule,
  rootPassword: passwordRule,
  resources: resourcesSchema,
  env: z.string().optional(),
  command: z.string().optional(),
});

export const postgresSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  databaseName: databaseNameRule.optional(),
  user: databaseUserRule.optional(),
  image: z.preprocess(emptyToUndefined, z.string().default("postgres:17")),
  password: passwordRule,
  resources: resourcesSchema,
  env: z.string().optional(),
  command: z.string().optional(),
});

export const redisSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.preprocess(emptyToUndefined, z.string().default("redis:7")),
  password: passwordRule,
  resources: resourcesSchema,
  env: z.string().optional(),
  command: z.string().optional(),
});

export const templateSchema = z.object({
  services: z.array(
    z.union([
      z.object({
        type: z.literal("app"),
        data: appSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("mysql"),
        data: mysqlSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("mariadb"),
        data: mariadbSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("mongo"),
        data: mongoSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("postgres"),
        data: postgresSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("redis"),
        data: redisSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("compose"),
        data: composeSchema.omit({ projectName: true }),
      }),
      z.object({
        type: z.literal("box"),
        data: boxSchema.omit({ projectName: true }),
      }),
    ])
  ),
});

export const cloudflareTunnelRuleSchema = z.object({
  id: z.string(),
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  subdomain: z.string(),
  domain: z.string(),
  path: z.string(),
  internalProtocol: z.enum(["http", "https"]),
  internalPort: z.number(),
  zoneId: z.string(),
  dnsRecordId: z.string(),
});
