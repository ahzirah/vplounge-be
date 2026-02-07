const { Pool } = require("pg");

if (!process.env.PG_CA_CERT) {
  console.warn("PG_CA_CERT is missing. DB SSL verification may fail.");
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.PG_CA_CERT,
  },
});

module.exports = { pool };