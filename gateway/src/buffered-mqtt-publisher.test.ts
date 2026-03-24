import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import type mqtt from 'mqtt';
import { BufferedMqttPublisher } from './buffered-mqtt-publisher';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class FakeMqttClient extends EventEmitter {
    public published: Array<{ topic: string; payload: string }> = [];
    public reconnectCount = 0;
    public endCalled = false;

    publish(topic: string, payload: string): void {
        this.published.push({ topic, payload });
    }

    reconnect(): void {
        this.reconnectCount += 1;
    }

    end(_force: boolean, _options: object, callback: () => void): void {
        this.endCalled = true;
        callback();
    }
}

describe('BufferedMqttPublisher', () => {
    it('buffers while disconnected and flushes on connect', async () => {
        const fakeClient = new FakeMqttClient();
        const publisher = new BufferedMqttPublisher({
            mqttHost: 'mqtt://fake',
            topic: 'factory/test/status',
            reconnectBaseMs: 5,
            reconnectMaxMs: 20,
            mqttClientFactory: () => fakeClient as unknown as mqtt.MqttClient,
        });

        publisher.start();
        publisher.publishOrBuffer({
            deviceId: 'INJ_MOLD_001',
            metrics: { temperature: 201, pressure: 120, cycle: 10 },
            status: 'WARNING',
            collectedAt: new Date().toISOString(),
        });

        assert.equal(fakeClient.published.length, 0);
        fakeClient.emit('connect');
        assert.equal(fakeClient.published.length, 1);
        assert.equal(fakeClient.published[0]?.topic, 'factory/test/status');

        fakeClient.emit('offline');
        await sleep(10);
        assert.equal(fakeClient.reconnectCount, 1);

        await publisher.stop();
        assert.equal(fakeClient.endCalled, true);
    });
});
