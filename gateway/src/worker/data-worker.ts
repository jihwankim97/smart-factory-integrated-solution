import { parentPort, workerData } from "node:worker_threads";
import type { RefinedData } from "../config/schemas/refined-data.schema";
import type { RawPlcData } from "../types/telemetry";

type WorkerConfig = {
    deviceId: string;
    warningTemp: number;
};

const config = (workerData ?? {}) as Partial<WorkerConfig>;
const deviceId = config.deviceId ?? 'UNKNOWN_DEVICE';
const warningTemp = config.warningTemp ?? 200;

if(parentPort){
    parentPort.on('message', (raw: RawPlcData)=>{
        const status = raw.temp > warningTemp ? 'WARNING' : 'NORMAL';

        const refinedData: RefinedData = {
            deviceId,
            metrics: {
                temperature: raw.temp,
                pressure: raw.pressure,
                cycle: raw.cycle,
            },
            status,
            collectedAt: new Date(raw.timestamp).toISOString(),
        }

        parentPort?.postMessage(refinedData);
    });
} else {
    console.error('Worker not running in a worker thread');
}
