const os = require("os");
const { execSync } = require("child_process");
const axios = require("axios");

const SERVER_ID = 16;
const API_URL = "http://192.168.1.7:3000/api/servers";

function obtenerIP() {
    const interfaces = os.networkInterfaces();

    for (const nombre of Object.keys(interfaces)) {
        for (const interfaz of interfaces[nombre]) {
            if (interfaz.family === "IPv4" && !interfaz.internal) {
                return interfaz.address;
            }
        }
    }

    return "Desconocida";
}

function obtenerDisco() {
    try {
        const resultado = execSync(
            "df -P / | tail -1 | awk '{print $5}'"
        ).toString().trim();

        return parseInt(resultado.replace("%", ""), 10);
    } catch {
        return null;
    }
}

function obtenerRAM() {
    return Math.round(
        (1 - os.freemem() / os.totalmem()) * 100
    );
}

function obtenerCPU() {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
        idle += cpu.times.idle;

        total +=
            cpu.times.user +
            cpu.times.nice +
            cpu.times.sys +
            cpu.times.irq +
            cpu.times.idle;
    }

    if (!obtenerCPU.anterior) {
        obtenerCPU.anterior = { idle, total };
        return 0;
    }

    const idleDelta = idle - obtenerCPU.anterior.idle;
    const totalDelta = total - obtenerCPU.anterior.total;

    obtenerCPU.anterior = { idle, total };

    if (totalDelta <= 0) {
        return 0;
    }

    return Math.round((1 - idleDelta / totalDelta) * 100);
}

async function enviarDatos() {

    const datos = {
        cpu_uso: obtenerCPU(),
        ram_uso: obtenerRAM(),
        disco_uso: obtenerDisco(),
        ip: obtenerIP()
    };

    console.log("Datos enviados:", datos);

    try {

        const respuesta = await axios.post(
            `${API_URL}/${SERVER_ID}/metrics`,
            datos
        );

        console.log("SysCore:", respuesta.data.mensaje);

    } catch (error) {

        console.error(
            "Error conectando con SysCore:",
            error.message
        );

    }
}

console.log("=== SYSCORE AGENT ===");
console.log("Servidor:", SERVER_ID);
console.log("Hostname:", os.hostname());

enviarDatos();

setInterval(enviarDatos, 10000);