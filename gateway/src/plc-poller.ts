// plc connection and register parsing
import { client as ModbusClient } from 'jsmodbus';
import { Socket } from 'net';
import fs from 'node:fs';
import { registerMapSchema, type RegisterMap } from './config/schemas/register-map.schema';
import type { RawPlcData } from './types/telemetry';

export type PlcConnectionOptions = {
    host: string;
    port: number;
};

type PlcPollerDeps = {
    clientFactory?: (socket: Socket) => InstanceType<typeof ModbusClient.TCP>;
    reconnectBaseMs?: number;
    reconnectMaxMs?: number;
};

export class PlcPoller  {
    private socket: Socket;
    private plcClient: InstanceType<typeof ModbusClient.TCP>;
    private readonly registerMap: RegisterMap;
    private pollingTimer?: NodeJS.Timeout;
    private reconnectTimer?: NodeJS.Timeout;
    private isStopped = false;
    private reconnectAttempt = 0;
    private options?: PlcConnectionOptions;
    private onData?: (data: RawPlcData) => void;
    private pollMs = 1000;
    private state: 'disconnected' | 'connected' | 'reconnecting' = 'disconnected';
    private readonly reconnectBaseMs: number;
    private readonly reconnectMaxMs: number;

    constructor(socket: Socket, registerMapPath: string, deps: PlcPollerDeps = {}) {
        this.socket = socket;
        this.plcClient = deps.clientFactory
            ? deps.clientFactory(this.socket)
            : new ModbusClient.TCP(this.socket);
        this.registerMap = this.loadRegisterMap(registerMapPath);
        this.reconnectBaseMs = deps.reconnectBaseMs ?? 1000;
        this.reconnectMaxMs = deps.reconnectMaxMs ?? 30000;
    }

    public startPolling(
        options: PlcConnectionOptions,
        onData: (data: RawPlcData) => void,
        pollMs = 1000
    ): void {
        this.isStopped = false;
        this.options = options;
        this.onData = onData;
        this.pollMs = pollMs;

        this.socket.on('connect', () => {
            this.state = 'connected';
            this.reconnectAttempt = 0;
            console.log(`PLC connected (${this.options?.host}:${this.options?.port})`);
            this.startPollLoop();
        });

        this.socket.on('close', () => {
            this.state = 'disconnected';
            this.clearPollingTimer();
            if (!this.isStopped) {
                this.scheduleReconnect();
            }
        });

        this.socket.on('error', (error) => {
            console.error('PLC socket error:', error);
        });

        this.connect();
    }

    public stop(): void {
        this.isStopped = true;
        this.state = 'disconnected';
        this.clearPollingTimer();
        this.clearReconnectTimer();
        this.socket.end();
    }

    public get connectionState(): 'disconnected' | 'connected' | 'reconnecting' {
        return this.state;
    }

    public get deviceId(): string {
        return this.registerMap.device.id;
    }

    public get warningTemp(): number {
        return this.registerMap.rules.warningTemp;
    }

    private loadRegisterMap(registerMapPath: string): RegisterMap {
        const raw = JSON.parse(fs.readFileSync(registerMapPath, 'utf-8'));
        const parsed = registerMapSchema.safeParse(raw);
        if (!parsed.success) {
            throw new Error(
                `Invalid register map at ${registerMapPath}: ${parsed.error.message}`
            );
        }
        return parsed.data;
    }

    private async readRegisters(): Promise<[number, number, number]> {
        const { startAddress, quantity } = this.registerMap.block;
        const res = await this.plcClient.readHoldingRegisters(startAddress, quantity);
        const values = res.response.body.values;

        const tempIndex = this.registerMap.metrics.temp.address - startAddress;
        const pressureIndex = this.registerMap.metrics.pressure.address - startAddress;
        const cycleIndex = this.registerMap.metrics.cycle.address - startAddress;

        const temp = values[tempIndex] * this.registerMap.metrics.temp.scale;
        const pressure = values[pressureIndex] * this.registerMap.metrics.pressure.scale;
        const cycle = values[cycleIndex] * this.registerMap.metrics.cycle.scale;

        return [temp, pressure, cycle];
    }

    private startPollLoop(): void {
        if (this.pollingTimer || !this.onData) {
            return;
        }

        const pollLoop = async () => {
            if (this.isStopped || this.state !== 'connected' || !this.onData) {
                return;
            }

            const startedAt = Date.now();
            try {
                const [temp, pressure, cycle] = await this.readRegisters();
                this.onData({ temp, pressure, cycle, timestamp: Date.now() });
            } catch (error) {
                console.error('Error during PLC polling:', error);
            }

            const elapsed = Date.now() - startedAt;
            const nextDelay = Math.max(0, this.pollMs - elapsed);
            this.pollingTimer = setTimeout(() => {
                this.pollingTimer = undefined;
                void pollLoop();
            }, nextDelay);
        };

        void pollLoop();
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer || this.isStopped) {
            return;
        }
        this.state = 'reconnecting';
        this.reconnectAttempt += 1;
        const delay = Math.min(
            this.reconnectBaseMs * (2 ** (this.reconnectAttempt - 1)),
            this.reconnectMaxMs
        );
        console.log(`PLC reconnect attempt ${this.reconnectAttempt} in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.connect();
        }, delay);
    }

    private connect(): void {
        if (!this.options || this.isStopped) {
            return;
        }
        if (!this.socket.connecting && this.state !== 'connected') {
            this.socket.connect(this.options);
        }
    }

    private clearPollingTimer(): void {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
            this.pollingTimer = undefined;
        }
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }
}