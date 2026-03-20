//mqtt 연결, 데이터 송신
import mqtt from 'mqtt';
import { refinedDataSchema, type RefinedData } from './config/schemas/refined-data.schema';

export type MqttPublisherConfig = {
    mqttHost: string;
    topic: string;
    reconnectBaseMs?: number;
    reconnectMaxMs?: number;
    mqttClientFactory?: () => mqtt.MqttClient;
};

export class BufferedMqttPublisher {
    private mqttClient: mqtt.MqttClient;
    private offlineBuffer: RefinedData[] = [];
    private isConnected = false;
    private readonly topic: string;
    private readonly mqttHost: string;
    private reconnectTimer?: NodeJS.Timeout;
    private reconnectAttempt = 0;
    private isStopped = false;
    private started = false;
    private readonly reconnectBaseMs: number;
    private readonly reconnectMaxMs: number;

    constructor(config: MqttPublisherConfig) {
        this.mqttHost = config.mqttHost;
        this.mqttClient = config.mqttClientFactory
            ? config.mqttClientFactory()
            : mqtt.connect(config.mqttHost, { reconnectPeriod: 0 });
        this.topic = config.topic;
        this.reconnectBaseMs = config.reconnectBaseMs ?? 1000;
        this.reconnectMaxMs = config.reconnectMaxMs ?? 30000;
    }
    
    public start(): void {
        if (this.started) {
            return;
        }
        this.started = true;
        this.isStopped = false;

        this.mqttClient.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempt = 0;
            this.clearReconnectTimer();
            console.log('Connected to MQTT broker');
            while (this.offlineBuffer.length > 0) {
                const nextData = this.offlineBuffer.shift();
                if (nextData) {
                    this.publishData(nextData);
                }
            }
        });
        
        this.mqttClient.on('offline', () => {
            this.isConnected = false;
            this.scheduleReconnect();
        });

        this.mqttClient.on('close', () => {
            this.isConnected = false;
            this.scheduleReconnect();
        });

        this.mqttClient.on('error', (error) => {
            console.error('MQTT client error:', error);
        });
    }

    public get connected(): boolean {
        return this.isConnected;
    }
    
    private publishData(data: RefinedData) {
        this.mqttClient.publish(this.topic, JSON.stringify(data), { qos:1});
    }

    public publishOrBuffer(data: unknown) {
        const parsed = refinedDataSchema.safeParse(data);
        if (!parsed.success) {
            console.error(`Invalid MQTT payload: ${parsed.error.message}`);
            return;
        }

        if (this.isConnected) {
            this.publishData(parsed.data);
        } else {
            this.offlineBuffer.push(parsed.data);
        }
    }

    public async stop(): Promise<void> {
        this.isStopped = true;
        this.isConnected = false;
        this.clearReconnectTimer();
        this.started = false;

        await new Promise<void>((resolve) => {
            this.mqttClient.end(true, {}, () => resolve());
        });
    }

    private scheduleReconnect(): void {
        if (this.isStopped || this.isConnected || this.reconnectTimer) {
            return;
        }
        this.reconnectAttempt += 1;
        const delay = Math.min(
            this.reconnectBaseMs * (2 ** (this.reconnectAttempt - 1)),
            this.reconnectMaxMs
        );
        console.log(`MQTT reconnect attempt ${this.reconnectAttempt} in ${delay}ms (${this.mqttHost})`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            if (!this.isStopped) {
                this.mqttClient.reconnect();
            }
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

}