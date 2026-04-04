import z from "zod";
import { ZOD_ERROR_MESSAGE } from "../../constants/zod.constant";

export const createCategorySchema = z.object({
  name: z.string().min(1, { error: ZOD_ERROR_MESSAGE.CATEGORY_NAME_REQUIRED }),
  description: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = CreateCategoryDto;