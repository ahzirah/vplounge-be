const { Pool } = require("pg");

function getPoolConfig() {
  // If Digital Ocean injects DATABASE_URL, use it
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }

  // Otherwise use PG* vars
  return {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(getPoolConfig());

module.exports = { pool };