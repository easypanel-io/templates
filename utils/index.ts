import { AjvError, FormValidation } from "@rjsf/core";
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

export function createTemplate<Schema extends JSONSchema7>(props: {
  name: string;
  schema: Schema;
  generate: (input: FromSchema<Schema>) => z.input<typeof templateSchema>;
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
