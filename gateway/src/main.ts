import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import { GatewayService } from './gateway-service';
import { loadGatewayConfig } from './config/load-gateway-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gatewayConfig = loadGatewayConfig(__dirname);

const gatewayService = new GatewayService(gatewayConfig);
gatewayService.start();

const shutdown = async () => {
    await gatewayService.stop();
    process.exit(0);
};

process.on('SIGINT', () => {
    void shutdown();
});

process.on('SIGTERM', () => {
    void shutdown();
});
