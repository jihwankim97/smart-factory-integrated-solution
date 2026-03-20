import { z } from 'zod';

export const refinedDataSchema = z.object({
    deviceId: z.string().min(1),
    metrics: z.object({
        temperature: z.number(),
        pressure: z.number(),
        cycle: z.number(),
    }),
    status: z.enum(['NORMAL', 'WARNING', 'ERROR']),
    collectedAt: z.string().datetime(),
});

export type RefinedData = z.infer<typeof refinedDataSchema>;
