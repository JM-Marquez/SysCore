import { getAlerts } from "./api.js";

let allAlerts = [];

export async function loadAlerts() {

    const tbody = document.getElementById("alertsTableBody");

    if (!tbody) return;

    allAlerts = await getAlerts();

    tbody.innerHTML = "";

    if (allAlerts.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No hay alertas.
                </td>
            </tr>
        `;

        return;
    }

    allAlerts.forEach(alert => {
    const mensajeTexto = alert.mensaje || "Sin detalle";
    
    // Intenta extraer el porcentaje entre paréntesis (95%) o cualquier número suelto (95)
    const matchPorcentaje = mensajeTexto.match(/\((\d+(?:\.\d+)?)%\)/) || mensajeTexto.match(/\d+/);
    const porcentajeNum = matchPorcentaje ? matchPorcentaje[1] || matchPorcentaje[0] : null;

    // Badge de color con o sin porcentaje según disponibilidad
    const textoPorcentajeBadge = porcentajeNum ? ` (${porcentajeNum}%)` : "";
    
    const nivelTexto =
        alert.nivel === "ERROR"
            ? `<span class="badge bg-danger">Crítico${textoPorcentajeBadge}</span>`
            : `<span class="badge bg-warning text-dark">Advertencia${textoPorcentajeBadge}</span>`;

    const estadoTexto =
        alert.estado === "activa"
            ? `<span class="badge bg-danger">Activa</span>`
            : `<span class="badge bg-success">Resuelta</span>`;

    tbody.innerHTML += `
        <tr data-nivel="${alert.nivel}" data-estado="${alert.estado}">
            <td>${alert.servidor}</td>
            <td>${new Date(alert.fecha).toLocaleString()}</td>
            <td>${alert.tipo}</td>
            <td>${nivelTexto}</td>
            <td>${mensajeTexto}</td>
            <td>${estadoTexto}</td>
        </tr>
    `;
});
}

export function initAlertsFilters() {

    const search = document.getElementById("searchAlerts");
    const filter = document.getElementById("filterAlerts");

    if (!search || !filter) return;

    function applyFilters() {

        const text = search.value.toLowerCase();
        const filtro = filter.value;

        const rows = document.querySelectorAll(
            "#alertsTableBody tr"
        );

        rows.forEach(row => {

            const contenido = row.textContent.toLowerCase();
            const nivel = row.dataset.nivel;
            const estado = row.dataset.estado;

            const visibleTexto =
                contenido.includes(text);

            const visibleFiltro =
                filtro === "" ||
                filtro === nivel ||
                filtro === estado;

            row.style.display =
                visibleTexto && visibleFiltro
                    ? ""
                    : "none";
        });
    }

    search.addEventListener("input", applyFilters);
    filter.addEventListener("change", applyFilters);
}