import { Worker } from 'worker_threads';
import {Socket} from 'net';
import { PlcPoller, type PlcConnectionOptions } from './plc-poller';
import { BufferedMqttPublisher, type MqttPublisherConfig } from './buffered-mqtt-publisher';

export type GatewayDeviceConfig = {
    plcOptions: PlcConnectionOptions;
    registerMapPath: string;
    pollMs?: number;
    reconnectBaseMs?: number;
    reconnectMaxMs?: number;
};

export type GatewayServiceConfig = {
    devices: GatewayDeviceConfig[];
    workerPath: string;
    pollMs: number;
    mqtt: MqttPublisherConfig;
};

export class GatewayService {
    private readonly mqttPublisher: BufferedMqttPublisher;
    private readonly pollers: PlcPoller[] = [];
    private readonly workers: Worker[] = [];
    private readonly config: GatewayServiceConfig;

    constructor(config: GatewayServiceConfig) {
        this.config = config;
        this.mqttPublisher = new BufferedMqttPublisher(this.config.mqtt);

        for (const device of this.config.devices) {
            const socket = new Socket();
            const poller = new PlcPoller(socket, device.registerMapPath, {
                reconnectBaseMs: device.reconnectBaseMs,
                reconnectMaxMs: device.reconnectMaxMs,
            });
            const worker = new Worker(this.config.workerPath, {
                workerData: {
                    deviceId: poller.deviceId,
                    warningTemp: poller.warningTemp,
                },
            });
            this.pollers.push(poller);
            this.workers.push(worker);
        }
    }

    public start(): void {
        this.mqttPublisher.start();

        this.pollers.forEach((poller, index) => {
            const worker = this.workers[index];
            if (!worker) {
                return;
            }

            const deviceConfig = this.config.devices[index]!;
            poller.startPolling(deviceConfig.plcOptions, (rawData) => {
                console.log(`[${poller.deviceId}] PLC Data Read:`, rawData);
                worker.postMessage(rawData);
            }, deviceConfig.pollMs ?? this.config.pollMs);

            worker.on('message', (refinedData) => {
                this.mqttPublisher.publishOrBuffer(refinedData);
            });
        });
    }

    public async stop(): Promise<void> {
        this.pollers.forEach((poller) => poller.stop());
        await this.mqttPublisher.stop();
        await Promise.all(this.workers.map((worker) => worker.terminate()));
    }
}

