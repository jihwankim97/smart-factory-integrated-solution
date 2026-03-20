import { z } from 'zod';

const deviceSchema = z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
    registerMapFile: z.string().min(1),
    pollMs: z.number().int().positive().optional(),
    reconnectBaseMs: z.number().int().positive().optional(),
    reconnectMaxMs: z.number().int().positive().optional(),
});

export const devicesSchema = z.object({
    devices: z.array(deviceSchema).min(1),
});

export type DevicesConfig = z.infer<typeof devicesSchema>;
