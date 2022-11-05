import { randomBytes } from "crypto";
import { z } from "zod";

export const randomPassword = () => randomBytes(10).toString("hex");

export const projectNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
export const serviceNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
export const volumeNameRule = z
  .string()
  .regex(
    /^[a-z0-9-_]+$/,
    "Invalid name. Use lowercase letters (a-z), digits (0-9), dash (-), underscore (_)."
  );
export const domainRule = z.string().regex(/^[a-z0-9.-]+$/);
export const portRule = z.number().min(0).max(65535);
export const passwordRule = z.string().default(randomPassword);

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

export const appSourceSchema = z
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
  ])
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

export const appPortsSchema = z
  .array(
    z.object({
      published: z.number(),
      target: z.number(),
      protocol: z.union([z.literal("tcp"), z.literal("udp")]).default("tcp"),
    })
  )
  .default([]);

export const appSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  source: appSourceSchema,
  build: appBuildSchema,
  env: z.string().default(""),
  proxy: z
    .object({
      port: z.number().default(80),
      secure: z.boolean().default(true),
    })
    .default({}),
  basicAuth: appBasicAuthSchema,
  deploy: appDeploySchema,
  domains: z
    .array(
      z.object({
        name: domainRule,
      })
    )
    .default([]),
  mounts: appMountsSchema,
  ports: appPortsSchema,
  resources: resourcesSchema,
});

export const mongoSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  resources: resourcesSchema,
});

export const mysqlSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  rootPassword: passwordRule,
  resources: resourcesSchema,
});

export const mariadbSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  rootPassword: passwordRule,
  resources: resourcesSchema,
});

export const postgresSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  resources: resourcesSchema,
});

export const redisSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  resources: resourcesSchema,
});

export const templateSchema = z.object({
  services: z.array(
    z.union([
      z.object({
        type: z.literal("app"),
        data: appSchema,
      }),
      z.object({
        type: z.literal("mysql"),
        data: mysqlSchema,
      }),
      z.object({
        type: z.literal("mariadb"),
        data: mariadbSchema,
      }),
      z.object({
        type: z.literal("mongo"),
        data: mongoSchema,
      }),
      z.object({
        type: z.literal("postgres"),
        data: postgresSchema,
      }),
      z.object({
        type: z.literal("redis"),
        data: redisSchema,
      }),
    ])
  ),
});
