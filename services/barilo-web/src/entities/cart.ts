import z from "zod";

const productSchema = z.object({
  id: z.string(),
  market: z.string(),
  location: z.string(),
  name: z.string(),
  price: z.number(),
  weight: z.string(),
  brand: z.string().nullable(),
});

export const cartItemSchema = z.object({
  quantity: z.number(),
  total_price: z.number(),
  product: productSchema,
});

export const cartSchema = cartItemSchema.array();
