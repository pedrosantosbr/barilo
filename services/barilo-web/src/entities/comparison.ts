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
  price: z.string(),
  weight: z.string(),
  brand: z.string().nullable(),
});

export const comparisonSchema = z.object({
  id: z.string(),
  name: z.string(),
  total: z.number(),
  products: productSchema.array(),
  cheapest_product: productSchema,
});

export const ComparisonSearchSchema = comparisonSchema.array();
