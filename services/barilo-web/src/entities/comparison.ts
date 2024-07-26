import z from "zod";

const productSchema = z.object({
  id: z.string(),
  market: z.string(),
  location: z.string(),
  name: z.string(),
  price: z.string(),
  weight: z.string(),
  brand: z.string().nullable(),
});

export const ComparisonSearchSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    total: z.number(),
    products: productSchema.array(),
    cheapest_product: productSchema,
  })
  .array();
