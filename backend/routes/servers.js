const express = require("express");

const router = express.Router();

const pool = require("../config/database");

const { registrarLog } = require("../utils/logger");

const { comprobarAlertas } = require("../utils/alerts");

// GET

router.get("/", async (req, res) => {

    const result = await pool.query(`

        SELECT *

        FROM servers

        ORDER BY id_server

    `);

    res.json(result.rows);

});

// POST

router.post("/", async (req, res) => {

    const {

        nombre,
        ip,
        sistema_operativo,
        cpu,
        ram,
        disco,
        estado

    } = req.body;

    await pool.query(

        `INSERT INTO servers
        (
            nombre,
            ip,
            sistema_operativo,
            cpu,
            ram,
            disco,
            estado
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,

        [

            nombre,
            ip,
            sistema_operativo,
            cpu,
            ram,
            disco,
            estado

        ]

    );

    res.json({

        mensaje: "Servidor creado correctamente"

    });

});

router.delete("/:id", async (req, res) => {

    const { id } = req.params;

    await pool.query(

        "DELETE FROM servers WHERE id_server = $1",

        [id]

    );

    res.json({ mensaje: "Servidor eliminado" });

});

router.put("/:id", async (req, res) => {

    const { id } = req.params;

    const {

        nombre,
        ip,
        sistema_operativo,
        cpu,
        ram,
        disco,
        estado

    } = req.body;

    await pool.query(

        `UPDATE servers
         SET nombre = $1,
             ip = $2,
             sistema_operativo = $3,
             cpu = $4,
             ram = $5,
             disco = $6,
             estado = $7
         WHERE id_server = $8`,

        [

            nombre,
            ip,
            sistema_operativo,
            cpu,
            ram,
            disco,
            estado,
            id

        ]

    );

    res.json({

        mensaje: "Servidor actualizado correctamente"

    });

});

// MÉTRICAS DEL AGENTE

router.post("/:id/metrics", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            cpu_uso,
            ram_uso,
            disco_uso,
            ip
        } = req.body;

        const servidorAnterior = await pool.query(
            `SELECT *
             FROM servers
             WHERE id_server = $1`,
            [id]
        );

        if (servidorAnterior.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Servidor no encontrado"
            });
        }

        const estadoAnterior = servidorAnterior.rows[0].estado;

        const result = await pool.query(
            `UPDATE servers
             SET cpu = $1,
                 ram = $2,
                 disco = $3,
                 ip = COALESCE($4, ip),
                 estado = 'online',
                 ultima_revision = NOW()
             WHERE id_server = $5
             RETURNING *`,
            [
                cpu_uso,
                ram_uso,
                disco_uso,
                ip,
                id
            ]
        );

                await pool.query(
            `INSERT INTO metrics
             (id_server, cpu, ram, disco)
             VALUES ($1, $2, $3, $4)`,
            [
                id,
                cpu_uso,
                ram_uso,
                disco_uso
            ]
        );

        await comprobarAlertas(
            id,
            "server",
            cpu_uso,
            ram_uso,
            disco_uso
        );

        if (estadoAnterior === "offline") {

            await registrarLog(
                id,
                "INFO",
                "Servidor recuperado y vuelve a estar online"
            );

        } else if (estadoAnterior !== "online") {

            await registrarLog(
                id,
                "INFO",
                "Servidor conectado y online"
            );

        }

        res.json({
            mensaje: "Métricas actualizadas correctamente",
            servidor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error actualizando métricas"
        });

    }

});

// HISTÓRICO DE MÉTRICAS

router.get("/:id/metrics", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                fecha,
                cpu,
                ram,
                disco
             FROM metrics
             WHERE id_server = $1
             ORDER BY fecha ASC`,
            [id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error obteniendo histórico de métricas"
        });

    }

});

// COMPROBAR SERVIDORES OFFLINE

router.post("/check-status", async (req, res) => {

    try {

        await pool.query(`
            UPDATE servers
            SET estado = 'offline'
            WHERE ultima_revision IS NOT NULL
            AND ultima_revision < NOW() - INTERVAL '30 seconds'
        `);

        res.json({
            mensaje: "Estados comprobados correctamente"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error comprobando estados"
        });

    }

});

module.exports = router;