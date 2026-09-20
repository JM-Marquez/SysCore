import {
    getPcs,
    createPc,
    updatePc,
    deletePc,
    getPcMetrics
} from "./api.js";

let editingPcId = null;


// =====================================================
// CARGAR SELECTOR DE USUARIOS
// =====================================================

export async function loadUsersSelect() {
    const select = document.getElementById("pcUsuario");
    if (!select) return;

    try {
        // Apuntamos al puerto 3000 de Node.js y a la ruta /api/users
        const response = await fetch("http://localhost:3000/api/users"); 
        
        if (!response.ok) {
            console.error("Error en la respuesta de usuarios:", response.status);
            return;
        }

        const usuarios = await response.json();

        select.innerHTML = '<option value="">-- Sin usuario asignado --</option>';

        usuarios.forEach(usuario => {
            select.innerHTML += `
                <option value="${usuario.id_usuario}">
                    ${usuario.nombre} ${usuario.apellido ? usuario.apellido : ""}
                </option>
            `;
        });
    } catch (error) {
        console.error("Error al cargar usuarios para el selector:", error);
    }
}


// =====================================================
// CARGAR PCS
// =====================================================

export async function loadPcs() {

    const tbody = document.querySelector("#pcs tbody");

    const pcs = await getPcs();

    tbody.innerHTML = "";

    if (pcs.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="table-empty">
                    No hay PCs registrados.
                </td>
            </tr>
        `;

        return;

    }

    pcs.forEach(pc => {

        tbody.innerHTML += `
            <tr>

                <td>${pc.nombre}</td>

                <td>${pc.ip}</td>

                <td>${pc.sistema_operativo ?? "-"}</td>

                <td>${pc.cpu}%</td>

                <td>${pc.ram}%</td>

                <td>${pc.estado}</td>

                <td>
                    ${pc.nombre_usuario 
                        ? pc.nombre_usuario 
                        : '<span style="color: #888;">Sin asignar</span>'}
                </td>

                <td>

                    <button
                        class="view-pc-metrics-btn"
                        data-id="${pc.id_pc}">
                        <i class="bi bi-bar-chart-fill"></i>
                    </button>

                    <button
                        class="edit-pc-btn"
                        data-id="${pc.id_pc}">
                        ✏️
                    </button>

                    <button
                        class="delete-pc-btn"
                        data-id="${pc.id_pc}">
                        <i class="bi bi-trash3-fill"></i>
                    </button>

                </td>

            </tr>
        `;

    });


    // =================================================
    // VER MÉTRICAS
    // =================================================

    document.querySelectorAll(".view-pc-metrics-btn").forEach(button => {

        button.addEventListener("click", async () => {

            try {
                const id = button.dataset.id;
                const pc = pcs.find(p => p.id_pc == id);
                const metrics = await getPcMetrics(id);

                document.getElementById("metricsServerTitle").textContent =
                    `Histórico - ${pc.nombre}`;

                document.getElementById("metricsServerStatus").textContent =
                    pc.estado;

                document.getElementById("metricsServerIp").textContent =
                    pc.ip;

                document.getElementById("serverMetricsModal").classList.remove("hidden");

                const labels = metrics.map(metric =>
                    new Date(metric.fecha).toLocaleTimeString()
                );

                const cpuData = metrics.map(metric => Number(metric.cpu));
                const ramData = metrics.map(metric => Number(metric.ram));
                const diskData = metrics.map(metric => Number(metric.disco));

                if (window.cpuChart instanceof Chart) window.cpuChart.destroy();
                if (window.ramChart instanceof Chart) window.ramChart.destroy();
                if (window.diskChart instanceof Chart) window.diskChart.destroy();

                window.cpuChart = new Chart(document.getElementById("cpuChart"), {
                    type: "line",
                    data: { labels, datasets: [{ label: "CPU (%)", data: cpuData, tension: 0.3, borderWidth: 2 }] },
                    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
                });

                window.ramChart = new Chart(document.getElementById("ramChart"), {
                    type: "line",
                    data: { labels, datasets: [{ label: "RAM (%)", data: ramData, tension: 0.3, borderWidth: 2 }] },
                    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
                });

                window.diskChart = new Chart(document.getElementById("diskChart"), {
                    type: "line",
                    data: { labels, datasets: [{ label: "Disco (%)", data: diskData, tension: 0.3, borderWidth: 2 }] },
                    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
                });

            } catch (error) {
                console.error("Error cargando métricas del PC:", error);
                alert("No se pudieron cargar las métricas del PC.");
            }

        });

    });

    // =================================================
    // BORRAR
    // =================================================

    document.querySelectorAll(".delete-pc-btn").forEach(button => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            const confirmar = confirm(
                "¿Eliminar este PC?"
            );

            if (!confirmar) return;

            await deletePc(id);

            alert("PC eliminado correctamente");

            await loadPcs();

        });

    });


    // =================================================
    // EDITAR
    // =================================================

    document.querySelectorAll(".edit-pc-btn").forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            editingPcId = Number(id);

            const pc = pcs.find(
                p => p.id_pc == id
            );

            document.getElementById("pcNombre").value =
                pc.nombre;

            document.getElementById("pcIp").value =
                pc.ip;

            document.getElementById("pcSO").value =
                pc.sistema_operativo ?? "";

            document.getElementById("pcCpu").value =
                pc.cpu ?? 0;

            document.getElementById("pcRam").value =
                pc.ram ?? 0;

            document.getElementById("pcDisco").value =
                pc.disco ?? 0;

            document.getElementById("pcEstado").value =
                pc.estado;

            const userSelect = document.getElementById("pcUsuario");
            if (userSelect) {
                userSelect.value = pc.id_usuario ?? "";
            }

            document.getElementById("pcModalTitle").textContent =
                "Editar PC";

            document.getElementById("savePc").textContent =
                "Guardar cambios";

            document.getElementById("pcModal")
                .classList.remove("hidden");

        });

    });

}


// =====================================================
// MODAL
// =====================================================

export function initPcsModal() {

    const modal =
        document.getElementById("pcModal");

    const openButton =
        document.querySelector("#pcs .btn-primary");

    const cancelButton =
        document.getElementById("cancelPc");

    const form =
        document.getElementById("pcForm");

    // Cargar la lista de usuarios al inicializar el modal
    loadUsersSelect();


    // =================================================
    // NUEVO PC
    // =================================================

    if (openButton) {
        openButton.addEventListener("click", () => {

            editingPcId = null;

            form.reset();

            const userSelect = document.getElementById("pcUsuario");
            if (userSelect) userSelect.value = "";

            document.getElementById("pcModalTitle").textContent =
                "Nuevo PC";

            document.getElementById("savePc").textContent =
                "Crear PC";

            modal.classList.remove("hidden");

        });
    }


    // =================================================
    // CANCELAR
    // =================================================

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {

            editingPcId = null;

            form.reset();

            const userSelect = document.getElementById("pcUsuario");
            if (userSelect) userSelect.value = "";

            document.getElementById("pcModalTitle").textContent =
                "Nuevo PC";

            document.getElementById("savePc").textContent =
                "Crear PC";

            modal.classList.add("hidden");

        });
    }


    // =================================================
    // GUARDAR
    // =================================================

    if (form) {
        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const nombre =
                document.getElementById("pcNombre")
                    .value.trim();

            const ip =
                document.getElementById("pcIp")
                    .value.trim();

            if (nombre === "") {

                alert("El nombre del PC es obligatorio.");

                return;

            }

            if (ip === "") {

                alert("La dirección IP es obligatoria.");

                return;

            }

            const ipRegex =
                /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

            if (!ipRegex.test(ip)) {

                alert("La dirección IP no es válida.");

                return;

            }

            const idUsuarioVal = document.getElementById("pcUsuario")
                ? document.getElementById("pcUsuario").value
                : "";

            const pc = {

                nombre,

                ip,

                sistema_operativo:
                    document.getElementById("pcSO").value,

                cpu:
                    Number(
                        document.getElementById("pcCpu").value
                    ),

                ram:
                    Number(
                        document.getElementById("pcRam").value
                    ),

                disco:
                    Number(
                        document.getElementById("pcDisco").value
                    ),

                estado:
                    document.getElementById("pcEstado").value,

                id_usuario: idUsuarioVal ? Number(idUsuarioVal) : null

            };


            // =============================================
            // CREAR
            // =============================================

            if (editingPcId === null) {

                await createPc(pc);

                alert("PC creado correctamente");

            }

            // =============================================
            // ACTUALIZAR
            // =============================================

            else {

                await updatePc(
                    editingPcId,
                    pc
                );

                alert("PC actualizado correctamente");

            }

            editingPcId = null;

            form.reset();

            modal.classList.add("hidden");

            await loadPcs();

        });
    }

}

setInterval(() => {
    loadPcs();
}, 10000);