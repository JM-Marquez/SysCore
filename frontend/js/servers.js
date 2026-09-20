let editingServerId = null;

import {
    getServers,
    createServer,
    updateServer,
    deleteServer,
    getServerMetrics
} from "./api.js";



export async function loadServers() {

    const tbody = document.querySelector("#servers tbody");

    const servers = await getServers();

    tbody.innerHTML = "";

    if (servers.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No hay servidores registrados.
                </td>
            </tr>
        `;

        return;

    }

    servers.forEach(server => {


        tbody.innerHTML += `
            <tr>

                <td>${server.nombre}</td>

                <td>${server.ip}</td>

                <td>${server.estado}</td>

                <td>${server.cpu}%</td>

                <td>${server.ram}%</td>

                <td>

    <button class="view-metrics-btn" data-id="${server.id_server}">
        <i class="bi bi-bar-chart-fill"></i>
    </button>

    <button class="edit-server-btn" data-id="${server.id_server}">
        <i class="bi bi-pencil-fill"></i>
    </button>

    <button class="delete-server-btn" data-id="${server.id_server}">
        <i class="bi bi-trash3-fill"></i>
    </button>

</td>

            </tr>
        `;

    });

    document.querySelectorAll(".view-metrics-btn").forEach(button => {

    button.addEventListener("click", async () => {

        try {

            const id = button.dataset.id;

            const server = servers.find(s => s.id_server == id);

            const metrics = await getServerMetrics(id);

            document.getElementById("metricsServerTitle").textContent =
                `Histórico - ${server.nombre}`;

            document.getElementById("metricsServerStatus").textContent =
                server.estado;

            document.getElementById("metricsServerIp").textContent =
                server.ip;

            document.getElementById("serverMetricsModal").classList.remove("hidden");


            const labels = metrics.map(metric =>
                new Date(metric.fecha).toLocaleTimeString()
            );

            const cpuData = metrics.map(metric =>
                Number(metric.cpu)
            );

            const ramData = metrics.map(metric =>
                Number(metric.ram)
            );

            const diskData = metrics.map(metric =>
                Number(metric.disco)
            );


           if (window.cpuChart instanceof Chart) {
    window.cpuChart.destroy();
}

if (window.ramChart instanceof Chart) {
    window.ramChart.destroy();
}

if (window.diskChart instanceof Chart) {
    window.diskChart.destroy();
}


            window.cpuChart = new Chart(
                document.getElementById("cpuChart"),
                {
                    type: "line",

                    data: {
                        labels: labels,

                        datasets: [{
                            label: "CPU (%)",
                            data: cpuData,
                            tension: 0.3,
                            borderWidth: 2
                        }]
                    },

                    options: {
                        responsive: true,

                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                }
            );


            window.ramChart = new Chart(
                document.getElementById("ramChart"),
                {
                    type: "line",

                    data: {
                        labels: labels,

                        datasets: [{
                            label: "RAM (%)",
                            data: ramData,
                            tension: 0.3,
                            borderWidth: 2
                        }]
                    },

                    options: {
                        responsive: true,

                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                }
            );


            window.diskChart = new Chart(
                document.getElementById("diskChart"),
                {
                    type: "line",

                    data: {
                        labels: labels,

                        datasets: [{
                            label: "Disco (%)",
                            data: diskData,
                            tension: 0.3,
                            borderWidth: 2
                        }]
                    },

                    options: {
                        responsive: true,

                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                }
            );

        } catch (error) {

            console.error("Error cargando métricas:", error);

            alert("No se pudieron cargar las métricas.");

        }

    });

});

    document.querySelectorAll(".delete-server-btn").forEach(button => {

    button.addEventListener("click", async () => {

        const id = button.dataset.id;

        const confirmar = confirm("¿Eliminar este servidor?");

if (!confirmar) return;

await deleteServer(id);

alert("Servidor eliminado correctamente");

await loadServers();

    });

});

    document.querySelectorAll(".edit-server-btn").forEach(button => {

    button.addEventListener("click", () => {

        const id = button.dataset.id;

        editingServerId = Number(id);

        const server = servers.find(s => s.id_server == id);

        document.getElementById("serverNombre").value = server.nombre;
        document.getElementById("serverIp").value = server.ip;
        document.getElementById("serverSO").value = server.sistema_operativo;
        document.getElementById("serverCpu").value = server.cpu;
        document.getElementById("serverRam").value = server.ram;
        document.getElementById("serverDisco").value = server.disco;
        document.getElementById("serverEstado").value = server.estado;

        document.getElementById("serverModalTitle").textContent = "Editar servidor";
        document.getElementById("saveServer").textContent = "Guardar cambios";

        document.getElementById("serverModal").classList.remove("hidden");

    });

});

} 

async function testServerMetrics(id) {

    const metrics = await getServerMetrics(id);

    console.log("Histórico del servidor:", metrics);

}


export function initServersModal() {

    const modal = document.getElementById("serverModal");

    const openButton = document.querySelector("#servers .btn-primary");

    const cancelButton = document.getElementById("cancelServer");

    const form = document.getElementById("serverForm");

    openButton.addEventListener("click", () => {

    editingServerId = null;

    document.getElementById("serverModalTitle").textContent = "Nuevo servidor";

    document.getElementById("saveServer").textContent = "Crear servidor";

    form.reset();

    modal.classList.remove("hidden");

});

cancelButton.addEventListener("click", () => {

    editingServerId = null;

    form.reset();

    document.getElementById("serverModalTitle").textContent = "Nuevo servidor";

    document.getElementById("saveServer").textContent = "Crear servidor";

    modal.classList.add("hidden");

});


    form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("serverNombre").value.trim();
    const ip = document.getElementById("serverIp").value.trim();

    if (nombre === "") {

        alert("El nombre del servidor es obligatorio.");

        return;

    }

    if (ip === "") {

        alert("La dirección IP es obligatoria.");

        return;

    }

    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    if (!ipRegex.test(ip)) {

        alert("La dirección IP no es válida.");

        return;

    }

    const serverData = {

        nombre,

        ip,

        sistema_operativo: document.getElementById("serverSO").value,

        cpu: document.getElementById("serverCpu").value,

        ram: document.getElementById("serverRam").value,

        disco: document.getElementById("serverDisco").value,

        estado: document.getElementById("serverEstado").value

    };

    if (editingServerId === null) {

        await createServer(serverData);

        alert("Servidor creado correctamente");

    } else {

        await updateServer(editingServerId, serverData);

        alert("Servidor actualizado correctamente");

    }

    editingServerId = null;

form.reset();

modal.classList.add("hidden");

await loadServers();

});

}

const closeMetricsModal = document.getElementById("closeMetricsModal");

closeMetricsModal.addEventListener("click", () => {

    document.getElementById("serverMetricsModal").classList.add("hidden");

});

setInterval(() => {
    loadServers();
}, 10000);