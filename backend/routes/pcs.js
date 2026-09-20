const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { comprobarAlertas } = require("../utils/alerts");

// ==========================
// GET - Obtener PCs (con JOIN a la tabla 'users')
// ==========================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pcs.*, users.nombre AS nombre_usuario
            FROM pcs
            LEFT JOIN users ON pcs.id_usuario = users.id_usuario
            ORDER BY pcs.id_pc
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error en GET /api/pcs:", error.message);
        res.status(500).json({ error: "Error al obtener los PCs" });
    }
});

// ==========================
// GET - Histórico de métricas
// ==========================
router.get("/:id/metrics", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                fecha,
                cpu,
                ram,
                disco
            FROM metrics
            WHERE id_pc = $1
            ORDER BY fecha ASC
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error obteniendo métricas del PC:", error.message);
        res.status(500).json({ error: "Error obteniendo histórico de métricas" });
    }
});

// ==========================
// POST - Crear PC
// ==========================
router.post("/", async (req, res) => {
    try {
        const {
            nombre,
            ip,
            sistema_operativo,
            cpu,
            ram,
            disco,
            estado,
            id_usuario
        } = req.body;

        const result = await pool.query(`
            INSERT INTO pcs
            (nombre, ip, sistema_operativo, cpu, ram, disco, estado, id_usuario, ultima_conexion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *
        `, [
            nombre,
            ip,
            sistema_operativo,
            cpu ?? 0,
            ram ?? 0,
            disco ?? 0,
            estado || "Activo",
            id_usuario ? Number(id_usuario) : null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error en POST /api/pcs:", error.message);
        res.status(500).json({ error: "Error al crear el PC" });
    }
});

// ==========================
// PUT - Actualizar PC (Dinámico)
// ==========================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            ip,
            sistema_operativo,
            cpu,
            ram,
            disco,
            estado,
            id_usuario
        } = req.body;

        // 1. Construir la consulta dinámicamente según los parámetros recibidos
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (nombre !== undefined) { updateFields.push(`nombre = $${paramIndex++}`); values.push(nombre); }
        if (ip !== undefined) { updateFields.push(`ip = $${paramIndex++}`); values.push(ip); }
        if (sistema_operativo !== undefined) { updateFields.push(`sistema_operativo = $${paramIndex++}`); values.push(sistema_operativo); }
        if (cpu !== undefined) { updateFields.push(`cpu = $${paramIndex++}`); values.push(cpu); }
        if (ram !== undefined) { updateFields.push(`ram = $${paramIndex++}`); values.push(ram); }
        if (disco !== undefined) { updateFields.push(`disco = $${paramIndex++}`); values.push(disco); }
        if (estado !== undefined) { updateFields.push(`estado = $${paramIndex++}`); values.push(estado); }
        if (id_usuario !== undefined) { updateFields.push(`id_usuario = $${paramIndex++}`); values.push(id_usuario ? Number(id_usuario) : null); }

        // Actualizar la hora de la última conexión recibida
        updateFields.push(`ultima_conexion = NOW()`);

        values.push(id); // ID para la condición WHERE

        const queryText = `
            UPDATE pcs
            SET ${updateFields.join(", ")}
            WHERE id_pc = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "PC no encontrado" });
        }

        const pcActualizado = result.rows[0];

        // 2. Guardar en historial de métricas
        if (cpu !== undefined || ram !== undefined || disco !== undefined) {
            try {
                await pool.query(`
                    INSERT INTO metrics (id_pc, fecha, cpu, ram, disco)
                    VALUES ($1, NOW(), $2, $3, $4)
                `, [id, cpu ?? pcActualizado.cpu, ram ?? pcActualizado.ram, disco ?? pcActualizado.disco]);
            } catch (metricsError) {
                console.error("Aviso [metrics]:", metricsError.message);
            }

            // 3. Evaluar alertas
            try {
                await comprobarAlertas(id, "pc", cpu ?? pcActualizado.cpu, ram ?? pcActualizado.ram, disco ?? pcActualizado.disco);
            } catch (alertsError) {
                console.error("Aviso [comprobarAlertas]:", alertsError.message);
            }
        }

        res.json(pcActualizado);

    } catch (error) {
        console.error("Error en PUT /api/pcs:", error.message);
        res.status(500).json({ error: "Error al actualizar el PC: " + error.message });
    }
});

// ==========================
// DELETE - Eliminar PC
// ==========================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`
            DELETE FROM pcs
            WHERE id_pc = $1
        `, [id]);

        res.json({ mensaje: "PC eliminado correctamente" });
    } catch (error) {
        console.error("Error en DELETE /api/pcs:", error.message);
        res.status(500).json({ error: "Error al eliminar el PC" });
    }
});

module.exports = router;