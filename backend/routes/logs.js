let allLogs = [];
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {

    const result = await pool.query(`
        SELECT
            l.id_log,
            s.nombre AS servidor,
            l.fecha,
            l.tipo,
            l.mensaje
        FROM logs l
        JOIN servers s
        ON l.id_server = s.id_server
        ORDER BY l.fecha DESC
    `);

    res.json(result.rows);

});

module.exports = router;