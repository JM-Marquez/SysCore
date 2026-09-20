const express = require("express");
const router = express.Router();

const pool = require("../config/database");

router.get("/", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                a.id_alerta,
                a.id_server,
                a.id_pc,

                CASE
                    WHEN a.id_server IS NOT NULL THEN s.nombre
                    WHEN a.id_pc IS NOT NULL THEN p.nombre
                    ELSE 'Desconocido'
                END AS servidor,

                a.fecha,
                a.tipo,
                a.nivel,
                a.mensaje,
                a.estado

            FROM alerts a

            LEFT JOIN servers s
                ON a.id_server = s.id_server

            LEFT JOIN pcs p
                ON a.id_pc = p.id_pc

            ORDER BY a.fecha DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error("Error obteniendo alertas:", error);

        res.status(500).json({
            mensaje: "Error obteniendo alertas"
        });
    }
});

module.exports = router;