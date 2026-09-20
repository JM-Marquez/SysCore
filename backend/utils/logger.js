const pool = require("../config/database");

async function registrarLog(idServer, tipo, mensaje) {

    await pool.query(
        `INSERT INTO logs
        (id_server, fecha, tipo, mensaje)
        VALUES ($1, NOW(), $2, $3)`,
        [
            idServer,
            tipo,
            mensaje
        ]
    );

}

module.exports = {
    registrarLog
};