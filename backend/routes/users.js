const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {

    const result = await pool.query(`
        SELECT
            u.id_usuario,
            u.nombre,
            u.email,
            u.id_rol,
            r.nombre AS rol,
            u.estado,
            u.ultimo_acceso AS "ultimoAcceso"
        FROM users u
        JOIN roles r
        ON u.id_rol = r.id_rol
    `);

    res.json(result.rows);

});

router.post("/", async (req, res) => {

    const { nombre, email, password, id_rol, estado } = req.body;

    await pool.query(
        `INSERT INTO users
        (nombre, email, password, id_rol, estado)
        VALUES ($1, $2, $3, $4, $5)`,
        [nombre, email, password, id_rol, estado]
    );

    res.json({ mensaje: "Usuario creado correctamente" });

});

router.delete("/:id", async (req, res) => {

    const { id } = req.params;

    await pool.query(

        "DELETE FROM users WHERE id_usuario = $1",

        [id]

    );

    res.json({ mensaje: "Usuario eliminado" });

});

router.put("/:id", async (req, res) => {

    const { id } = req.params;

    const { nombre, email, id_rol, estado } = req.body;

    await pool.query(

        `UPDATE users
         SET nombre = $1,
             email = $2,
             id_rol = $3,
             estado = $4
         WHERE id_usuario = $5`,

        [nombre, email, id_rol, estado, id]

    );

    res.json({

        mensaje: "Usuario actualizado correctamente"

    });

});

module.exports = router;