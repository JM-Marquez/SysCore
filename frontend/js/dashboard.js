import { getDashboard, getAlerts, getPcs } from "./api.js";

export async function loadDashboard() {

    const data = await getDashboard();

    document.getElementById("users-value").textContent =
        data.usuarios;

    document.getElementById("servers-value").textContent =
        data.servidores;

    document.getElementById("logs-value").textContent =
        data.logs;

    const [alerts, pcs] = await Promise.all([
        getAlerts(),
        getPcs()
    ]);

    const alertsActivas = alerts.filter(
        alert => alert.estado === "activa"
    );

    document.getElementById("alerts-value").textContent =
        alertsActivas.length;

    document.getElementById("pcs-value").textContent =
        pcs.length;

    if (Number(data.errores) === 0) {

        document.getElementById("status-value").textContent =
            "Operativo";

    } else {

        document.getElementById("status-value").textContent =
            "Incidencias";

    }

}