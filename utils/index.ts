import { hashSync } from "bcryptjs";
import { z } from "zod";
import { templateSchema } from "./schema";
export { randomPassword, randomString } from "./schema";

export type Output = z.input<typeof templateSchema>;
export type Services = Output["services"];

export const bcryptHash = (input: string) => hashSync(input);
