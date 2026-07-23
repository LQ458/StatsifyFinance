import { z } from "zod";

export const SAFE_USER_PROJECTION = {
  _id: 1,
  username: 1,
  admin: 1,
  email: 1,
  image: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

export const adminUserUpdateSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase())
      .optional(),
    admin: z.boolean().optional(),
    image: z.string().trim().max(2048).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0);

export function serializeSafeUser(user: Record<string, unknown>) {
  return {
    _id: user._id,
    username: user.username,
    admin: user.admin === true,
    email: user.email,
    image: user.image ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
