import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import * as path from "node:path";
import { PlcPoller } from './plc-poller';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class FakeSocket extends EventEmitter {
    public connectCalls = 0;
    public connecting = false;

    connect(): void {
        this.connectCalls += 1;
        this.connecting = true;
        setTimeout(() => {
            this.connecting = false;
            this.emit('connect');
        }, 0);
    }

    end(): void {
        this.emit('close');
    }
}

describe('PlcPoller', () => {
    it('reconnects with backoff after close', async () => {
        const fakeSocket = new FakeSocket();
        const fakeClient = {
            readHoldingRegisters: async () => ({
                response: {
                    body: {
                        values: [190, 120, 12],
                    },
                },
            }),
        };

        const registerMapPath = path.join(process.cwd(), 'src', 'config', 'register-map.json');
        const poller = new PlcPoller(
            fakeSocket as never,
            registerMapPath,
            {
                clientFactory: () => fakeClient as never,
                reconnectBaseMs: 5,
                reconnectMaxMs: 20,
            }
        );

        const samples: Array<{ temp: number; pressure: number; cycle: number }> = [];
        poller.startPolling(
            { host: '127.0.0.1', port: 5020 },
            (data) => {
                samples.push({ temp: data.temp, pressure: data.pressure, cycle: data.cycle });
            },
            5
        );

        await sleep(20);
        assert.ok(samples.length > 0);
        assert.equal(poller.connectionState, 'connected');

        const beforeReconnectCalls = fakeSocket.connectCalls;
        fakeSocket.emit('close');
        await sleep(25);
        assert.ok(fakeSocket.connectCalls > beforeReconnectCalls);

        poller.stop();
        const callCountAfterStop = fakeSocket.connectCalls;
        fakeSocket.emit('close');
        await sleep(25);
        assert.equal(fakeSocket.connectCalls, callCountAfterStop);
    });
});
