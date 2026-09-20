const pool = require("../config/database");

/**
 * Evalúa y gestiona alertas automáticas de hardware para Servidores y PCs.
 * @param {number} id - ID del equipo (id_server o id_pc)
 * @param {'server' | 'pc'} tipoEntidad - Tipo de dispositivo
 * @param {number|string} cpu - Porcentaje de uso de CPU
 * @param {number|string} ram - Porcentaje de uso de RAM
 * @param {number|string} disco - Porcentaje de uso de Disco
 */
async function comprobarAlertas(id, tipoEntidad, cpu, ram, disco) {

    // Sanitizar valores a números reales
    const cpuNum = parseFloat(String(cpu).replace("%", "")) || 0;
    const ramNum = parseFloat(String(ram).replace("%", "")) || 0;
    const discoNum = parseFloat(String(disco).replace("%", "")) || 0;

    const esPc = tipoEntidad.toLowerCase() === "pc";
    const columnaId = esPc ? "id_pc" : "id_server";
    const etiquetaEntidad = esPc ? "PC" : "Servidor";

    const recursos = [
        {
            tipo: "CPU",
            valor: cpuNum,
            warning: 80,
            critical: 90,
            tiempo: 120,
            mensajeWarning: `Uso de CPU elevado en ${etiquetaEntidad}`,
            mensajeCritical: `Uso de CPU crítico en ${etiquetaEntidad}`
        },
        {
            tipo: "RAM",
            valor: ramNum,
            warning: 85,
            critical: 95,
            tiempo: 120,
            mensajeWarning: `Uso de RAM elevado en ${etiquetaEntidad}`,
            mensajeCritical: `Uso de RAM crítico en ${etiquetaEntidad}`
        },
        {
            tipo: "DISCO",
            valor: discoNum,
            warning: 90,
            critical: 95,
            tiempo: 0,
            mensajeWarning: `Uso de disco elevado en ${etiquetaEntidad}`,
            mensajeCritical: `Uso de disco crítico en ${etiquetaEntidad}`
        }
    ];

    for (const recurso of recursos) {

        let nivel = null;
        let mensaje = null;

        if (recurso.valor >= recurso.critical) {
            nivel = "ERROR";
            mensaje = `${recurso.mensajeCritical} (${recurso.valor}%)`;
        } else if (recurso.valor >= recurso.warning) {
            nivel = "WARNING";
            mensaje = `${recurso.mensajeWarning} (${recurso.valor}%)`;
        }

        // 1. Buscar si ya existe una alerta activa para este equipo y recurso
        const alertaActiva = await pool.query(
            `SELECT id_alerta
             FROM alerts
             WHERE ${columnaId} = $1
             AND tipo = $2
             AND estado = 'activa'
             LIMIT 1`,
            [id, recurso.tipo]
        );

        // 2. Resolver alerta si el recurso volvió a valores normales
        if (!nivel) {
            if (alertaActiva.rows.length > 0) {
                await pool.query(
                    `UPDATE alerts
                     SET estado = 'resuelta'
                     WHERE id_alerta = $1`,
                    [alertaActiva.rows[0].id_alerta]
                );
                console.log(`[ALERTA RESUELTA] ${recurso.tipo} para ${etiquetaEntidad} ${id}`);
            }
            continue;
        }

        // 3. Regla de persistencia (8 lecturas en 2 minutos para CPU/RAM)
        if (recurso.tiempo > 0) {
            const lecturas = await pool.query(
                `SELECT COUNT(*) AS total
                 FROM metrics
                 WHERE ${columnaId} = $1
                 AND fecha >= NOW() - INTERVAL '2 minutes'
                 AND ${recurso.tipo === "CPU" ? "cpu" : "ram"} >= $2`,
                [id, recurso.warning]
            );

            const totalLecturas = parseInt(lecturas.rows[0].total, 10);
            
            console.log(`[ALERTAS] ${recurso.tipo} en ${etiquetaEntidad} ${id}: Valor actual ${recurso.valor}%. Lecturas elevadas en 2 min: ${totalLecturas}/8 necesarias.`);

            if (totalLecturas < 8) {
                continue;
            }
        }

        // 4. Crear la alerta si no existe o actualizar nivel/mensaje si cambió
        if (alertaActiva.rows.length === 0) {
            await pool.query(
                `INSERT INTO alerts
                 (${columnaId}, fecha, tipo, nivel, mensaje, estado)
                 VALUES ($1, NOW(), $2, $3, $4, 'activa')`,
                [id, recurso.tipo, nivel, mensaje]
            );
            console.log(`[ALERTA CREADA] ${recurso.tipo} para ${etiquetaEntidad} ${id}`);
        } else {
            await pool.query(
                `UPDATE alerts
                 SET nivel = $1,
                     mensaje = $2
                 WHERE id_alerta = $3`,
                [nivel, mensaje, alertaActiva.rows[0].id_alerta]
            );
        }
    }
}

module.exports = {
    comprobarAlertas
};