const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Syscore",
    password: "xxxx",
    port: 5432
});

module.exports = pool;