import { hashSync } from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { templateSchema } from "./schema";
export { randomPassword } from "./schema";

export type Output = z.input<typeof templateSchema>;
export type Services = Output["services"];

export const randomString = (length: number = 10) =>
  randomBytes(Math.round(length / 2)).toString("hex");

export const bcryptHash = (input: string) => hashSync(input);
