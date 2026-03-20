import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devicesConfigPath = path.join(__dirname, "config", "devices.json");
const devicesConfig = JSON.parse(fs.readFileSync(devicesConfigPath, "utf-8"));

const simulators = devicesConfig.devices.map((device) => ({
    port: device.port,
    map: path.join("src", "config", device.registerMapFile),
}));

const children = simulators.map((sim) =>
    spawn(process.execPath, ["src/simulator.js", `--port=${sim.port}`, `--map=${sim.map}`], {
        stdio: "inherit",
    })
);

const shutdown = () => {
    for (const child of children) {
        if (child.pid) {
            child.kill("SIGTERM");
        }
    }
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
