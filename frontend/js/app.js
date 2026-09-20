import "./navigation.js";
import { renderApp } from "./render.js";
import { loadUsers, initUsersModal } from "./users.js";
import { loadServers, initServersModal } from "./servers.js";
import { loadLogs, initLogsFilters } from "./logs.js";
import { loadAlerts, initAlertsFilters } from "./alerts.js";
import { loadPcs, initPcsModal } from "./pcs.js";

// Inicialización de la UI general
renderApp();

// Carga inicial de datos
loadUsers();
loadServers();
loadLogs();
loadAlerts();
loadPcs();

// Event listeners y filtros
initUsersModal();
initServersModal();
initPcsModal();
initLogsFilters();
initAlertsFilters();