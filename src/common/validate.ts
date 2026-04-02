import type { z } from "zod";

export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
