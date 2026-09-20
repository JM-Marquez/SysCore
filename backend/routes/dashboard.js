const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {

    const usuarios = await pool.query(
        "SELECT COUNT(*) FROM users"
    );

    const servidores = await pool.query(
        "SELECT COUNT(*) FROM servers"
    );

    const errores = await pool.query(
        "SELECT COUNT(*) FROM logs WHERE tipo = 'ERROR'"
    );

    const warnings = await pool.query(
        "SELECT COUNT(*) FROM logs WHERE tipo = 'WARNING'"
    );

    const totalLogs = await pool.query(
    "SELECT COUNT(*) FROM logs"
);

    const ultimosLogs = await pool.query(`
        SELECT
            s.nombre AS servidor,
            l.fecha,
            l.tipo,
            l.mensaje
        FROM logs l
        JOIN servers s
        ON l.id_server = s.id_server
        ORDER BY l.fecha DESC
        LIMIT 5
    `);

    res.json({

        usuarios: usuarios.rows[0].count,

        servidores: servidores.rows[0].count,

        errores: errores.rows[0].count,

        warnings: warnings.rows[0].count,

        logs: totalLogs.rows[0].count,

        ultimosLogs: ultimosLogs.rows

    });

});

module.exports = router;