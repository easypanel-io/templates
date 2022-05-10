import { randomBytes } from "crypto";
import { z } from "zod";

export const randomPassword = () => randomBytes(10).toString("hex");

export const projectNameRule = z.string().regex(/^[a-z0-9-_.]+$/);
export const serviceNameRule = projectNameRule;
export const domainRule = z.string().regex(/^[a-z0-9.-]+$/);
export const portRule = z.number().min(1);
export const passwordRule = z.string().default(randomPassword);

export const appSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  source: z
    .union([
      z.object({
        type: z.literal("image"),
        image: z.string(),
      }),
      z.object({
        type: z.literal("github"),
        owner: z.string(),
        repo: z.string(),
        ref: z.string(),
        path: z.string(),
        autoDeploy: z.boolean(),
      }),
    ])
    .optional(),
  env: z.string().default(""),
  proxy: z
    .object({
      port: z.number().default(80),
      secure: z.boolean().default(true),
    })
    .default({}),
  deploy: z
    .object({
      replicas: z.number().default(1),
    })
    .default({}),
  domains: z
    .array(
      z.object({
        name: domainRule,
      })
    )
    .default([]),
  volumes: z
    .array(
      z.object({
        type: z.union([z.literal("bind"), z.literal("volume")]),
        source: z.string().min(1),
        target: z.string().min(1),
      })
    )
    .default([]),
  ports: z
    .array(
      z.object({
        published: z.number(),
        target: z.number(),
      })
    )
    .default([]),
});

export const mongoSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
});

export const mysqlSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
  rootPassword: passwordRule,
});

export const postgresSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
});

export const redisSchema = z.object({
  projectName: projectNameRule,
  serviceName: serviceNameRule,
  image: z.string().optional(),
  password: passwordRule,
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
