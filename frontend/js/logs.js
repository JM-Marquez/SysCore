import { getLogs } from "./api.js";


let allLogs = [];

export async function loadLogs() {

    const tbody = document.getElementById("logsTableBody");

    allLogs = await getLogs();

    const logs = allLogs;

    tbody.innerHTML = "";

    if (logs.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="table-empty">
                    No hay registros.
                </td>
            </tr>
        `;

        return;

    }

    logs.forEach(log => {

        tbody.innerHTML += `
                <tr data-tipo="${log.tipo}">

                <td>${log.servidor}</td>

                <td>${new Date(log.fecha).toLocaleString()}</td>

                <td>${log.tipo}</td>

                <td>${log.mensaje}</td>

            </tr>
        `;

    });

}

export function initLogsFilters() {

    const search = document.getElementById("searchLogs");

    const filter = document.getElementById("filterLogs");

    if (!search || !filter) return;

    function applyFilters() {

        const text = search.value.toLowerCase();

        const tipo = filter.value;

        const rows = document.querySelectorAll("#logs tbody tr");

        rows.forEach(row => {

            const contenido = row.textContent.toLowerCase();

            const tipoRow = row.dataset.tipo;

            const visibleTexto = contenido.includes(text);

            const visibleTipo = tipo === "" || tipo === tipoRow;

            row.style.display = (visibleTexto && visibleTipo)
                ? ""
                : "none";

        });

    }

    search.addEventListener("input", applyFilters);

    filter.addEventListener("change", applyFilters);

}