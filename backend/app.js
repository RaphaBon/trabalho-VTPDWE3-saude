// Servidor da API: configura o Express e liga as rotas.
// Para rodar: node apps.js


const express = require('express');
const bodyParser = require('body-parser');
// Carrega o .env em process.env.
require('dotenv').config();

const router = require('./routes/router');
 
const app = express();
const port = 40000;

// CORS: libera o front (porta 40100) a chamar esta API, inclusive com Authorization.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Responde o preflight do navegador.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  // Segue para a próxima etapa.
  next();
});

// Permite ler o corpo da requisição (form e JSON) em req.body.
app.use(bodyParser.urlencoded({ extended: false, }));
app.use(express.json());

//@ Utiliza o routerApp configurado em ./routes/route.js
app.use(router);



app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
