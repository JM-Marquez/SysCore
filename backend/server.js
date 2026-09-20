const express = require("express");

const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard");

const usersRoutes = require("./routes/users");

const serversRoutes = require("./routes/servers");

const logsRoutes = require("./routes/logs");

const pcsRouter = require("./routes/pcs");

const pool = require("./config/database");

const { registrarLog } = require("./utils/logger");

const alertsRoutes = require("./routes/alerts");




const app = express();

app.use(cors());
app.use(express.json());



const PORT = 3000;

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/servers", serversRoutes);

app.use("/api/logs", logsRoutes);

app.use("/api/alerts", alertsRoutes);

app.use("/api/pcs", pcsRouter);

app.get("/", (req, res) => {

    res.send("Backend SysCore funcionando");

});

setInterval(async () => {
    try {
        const result = await pool.query(`
            UPDATE servers
            SET estado = 'offline'
            WHERE ultima_revision IS NOT NULL
            AND ultima_revision < NOW() - INTERVAL '30 seconds'
            AND estado <> 'offline'
            RETURNING id_server
        `);

        for (const server of result.rows) {
            await registrarLog(
                server.id_server,
                "WARNING",
                "Servidor sin comunicación y marcado como offline"
            );
        }

    } catch (error) {
        console.error("Error comprobando estados:", error.message);
    }
}, 10000);

app.listen(PORT, () => {

    console.log(`Servidor iniciado en http://localhost:${PORT}`);

});