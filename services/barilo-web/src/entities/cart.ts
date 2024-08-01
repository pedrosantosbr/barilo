import z from "zod";

const marketSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const locationSchema = z.object({
  address: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  market: marketSchema,
  location: locationSchema,
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
