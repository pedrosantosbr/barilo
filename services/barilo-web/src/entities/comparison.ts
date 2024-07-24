import z from "zod";

export const ComparisonSearchSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    total: z.number(),
    products: z.array(
      z.object({
        id: z.string(),
        market: z.string(),
        location: z.string(),
        name: z.string(),
        price: z.string(),
        weight: z.string(),
        brand: z.string().nullable(),
      })
    ),
    min_price: z.number(),
    max_price: z.number(),
  })
  .array();
