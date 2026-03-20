import { z } from 'zod';

export const metricSchema = z.object({
    address: z.number().int().min(0),
    scale: z.number().positive(),
});

export const registerMapSchema = z.object({
    device: z.object({
        id: z.string().min(1),
    }),
    rules: z.object({
        warningTemp: z.number(),
    }),
    block: z.object({
        startAddress: z.number().int().min(0),
        quantity: z.number().int().positive(),
    }),
    metrics: z.object({
        temp: metricSchema,
        pressure: metricSchema,
        cycle: metricSchema,
    }),
});

export type RegisterMap = z.infer<typeof registerMapSchema>;
