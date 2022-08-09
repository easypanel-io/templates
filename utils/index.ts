import { AjvError, FormValidation } from "@rjsf/core";
import { hashSync } from "bcryptjs";
import { randomBytes } from "crypto";
import { FromSchema, JSONSchema7 } from "json-schema-to-ts";
import { z } from "zod";
import {
  appSchema,
  mongoSchema,
  mysqlSchema,
  postgresSchema,
  redisSchema,
  templateSchema,
} from "./schema";
export { randomPassword } from "./schema";

export type AppService = z.input<typeof appSchema>;
export type MySQLService = z.input<typeof mysqlSchema>;
export type MongoService = z.input<typeof mongoSchema>;
export type PostgresService = z.input<typeof postgresSchema>;
export type RedisService = z.input<typeof redisSchema>;
export type Template = z.input<typeof templateSchema>;
export type Services = Template["services"];

export function createTemplate<Schema extends JSONSchema7>(props: {
  name: string;
  meta?: {
    description?: string;
    instructions?: string;
    changeLog?: {
      date: string;
      description: string;
    }[];
    links?: {
      label: string;
      url: string;
    }[];
    contributors?: {
      name: string;
      url: string;
    }[];
  };
  schema: Schema;
  generate: (input: FromSchema<Schema>) => Template;
  validate?: (
    formData: FromSchema<Schema>,
    error: FormValidation
  ) => FormValidation;
  transformErrors?: (errors: AjvError[]) => AjvError[];
}) {
  return props;
}

export const randomString = (length: number = 10) =>
  randomBytes(Math.round(length / 2)).toString("hex");

export const bcryptHash = (input: string ) => hashSync(input)