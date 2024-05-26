/* Store aggregation */

import z from 'zod';

const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(), // Using string to represent Decimal fields
  weight: z.string(),
  brand: z.string().nullable()
});

const CircularProductSchema = z.object({
  id: z.number(),
  product: ProductSchema,
  discount_price: z.string() // Using string to represent Decimal fields
});

const StoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email()
});

const CircularSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  store: StoreSchema,
  expiration_date: z.string(), // Using string to represent Date fields
  items: z.array(CircularProductSchema)
});
export type Circular = z.infer<typeof CircularSchema>;

export const CircularListResponseSchema = z.array(CircularSchema);

// TypeScript type derived from the Zod schema
export type CircularListResponse = z.infer<typeof CircularListResponseSchema>;