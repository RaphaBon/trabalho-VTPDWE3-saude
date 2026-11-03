// Conexão com o PostgreSQL usada por todos os models.
const Pool = require('pg').Pool
// DATE (1082) volta como texto 'AAAA-MM-DD', sem problema de fuso.
require('pg').types.setTypeParser(1082, (v) => v);

// Pool de conexões com os dados do .env.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
})

// query(sql, params): troca $1, $2... pelos valores de params.
module.exports = {
    query: (text, params) => pool.query(text, params),
  };
