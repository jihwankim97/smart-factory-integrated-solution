import fs from 'node:fs';
import path from 'node:path';
import { devicesSchema } from './schemas/devices.schema';
import type { GatewayServiceConfig } from '../gateway-service';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const loadGatewayConfig = (baseDir: string): GatewayServiceConfig => {
    const plcReconnectBaseMs = parsePositiveInt(process.env.PLC_RECONNECT_BASE_MS, 1000);
    const plcReconnectMaxMs = parsePositiveInt(process.env.PLC_RECONNECT_MAX_MS, 30000);
    const pollMsDefault = parsePositiveInt(process.env.POLL_MS, 1000);

    const devicesConfigPath = path.join(baseDir, 'config', 'devices.json');
    const devicesConfigRaw = JSON.parse(fs.readFileSync(devicesConfigPath, 'utf-8'));
    const devicesConfigParsed = devicesSchema.safeParse(devicesConfigRaw);

    if (!devicesConfigParsed.success) {
        throw new Error(`Invalid devices config at ${devicesConfigPath}: ${devicesConfigParsed.error.message}`);
    }

    return {
        devices: devicesConfigParsed.data.devices.map((device, index) => ({
            plcOptions: {
                host: process.env[`PLC_HOST_${index + 1}`] || process.env.PLC_HOST || device.host,
                port: parsePositiveInt(
                    process.env[`PLC_PORT_${index + 1}`] ||
                    (index === 0 ? process.env.PLC_PORT : undefined) ||
                    `${device.port}`,
                    device.port
                ),
            },
            registerMapPath: path.join(baseDir, 'config', device.registerMapFile),
            pollMs: parsePositiveInt(
                process.env[`POLL_MS_${index + 1}`] || `${device.pollMs ?? pollMsDefault}`,
                device.pollMs ?? pollMsDefault
            ),
            reconnectBaseMs: device.reconnectBaseMs ?? plcReconnectBaseMs,
            reconnectMaxMs: device.reconnectMaxMs ?? plcReconnectMaxMs,
        })),
        workerPath: path.join(baseDir, 'worker', 'data-worker.ts'),
        pollMs: pollMsDefault,
        mqtt: {
            mqttHost: process.env.MQTT_HOST || 'mqtt://localhost:1883',
            topic: process.env.MQTT_TOPIC || 'factory/line1/status',
            reconnectBaseMs: parsePositiveInt(process.env.MQTT_RECONNECT_BASE_MS, 1000),
            reconnectMaxMs: parsePositiveInt(process.env.MQTT_RECONNECT_MAX_MS, 30000),
        },
    };
};
