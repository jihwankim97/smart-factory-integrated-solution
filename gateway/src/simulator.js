import Modbus from "jsmodbus";
import { Server as NetServer } from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliArgs = process.argv.slice(2);
const portArg = cliArgs.find((arg) => arg.startsWith("--port="));
const mapArg = cliArgs.find((arg) => arg.startsWith("--map="));

const port = portArg ? Number(portArg.split("=")[1]) : 5020;
const mapPathArg = mapArg ? mapArg.split("=")[1] : path.join(__dirname, "config", "register-map.json");
const registerMapPath = path.isAbsolute(mapPathArg)
    ? mapPathArg
    : path.resolve(process.cwd(), mapPathArg);
const registerMap = JSON.parse(fs.readFileSync(registerMapPath, "utf-8"));
const toByteOffset = (address) => address * 2;

const netServer = new NetServer();
const modbusServer = new Modbus.server.TCP(netServer);

netServer.listen(port, ()=>{
    console.log(`Modbus TCP Server is running on port ${port} (${registerMap.device?.id ?? "UNKNOWN"})`);
});

setInterval(()=>{
    const registers = modbusServer.holding;
    registers.writeUInt16BE(
        Math.floor(Math.random()*20)+185,
        toByteOffset(registerMap.metrics.temp.address)
    );
    registers.writeUInt16BE(
        Math.floor(Math.random()*40)+110,
        toByteOffset(registerMap.metrics.pressure.address)
    );
    const cycleOffset = toByteOffset(registerMap.metrics.cycle.address);
    registers.writeUInt16BE((registers.readUInt16BE(cycleOffset)+1)%1000, cycleOffset);
}, 1000)