/* Store aggregation */

import z from "zod";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(), // Using string to represent Decimal fields
  weight: z.string(),
  brand: z.string().nullable(),
});

const CircularProductSchema = z.object({
  id: z.string(),
  product: ProductSchema,
  discount_price: z.string(), // Using string to represent Decimal fields
});

const MarketSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone_number: z.string(),
  email: z.string().email(),
});

const CircularSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  market: MarketSchema,
  expiration_date: z.string(), // Using string to represent Date fields
  items: z.array(CircularProductSchema),
});
export type Circular = z.infer<typeof CircularSchema>;

export const CircularListResponseSchema = z.array(CircularSchema);

// TypeScript type derived from the Zod schema
export type CircularListResponse = z.infer<typeof CircularListResponseSchema>;
