// Telas de consultas: listagem e formulário.
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('consultas/vwLstConsultas', {
    title: 'Consultas',
    showNavbar: true,
    activeMenu: 'consultas',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois, o front em html não acesso ao arquivo .env
  });
});

// A operação vem em ?oper= (Cr, Re, Up, De).
router.get('/form', function(req, res) {
  res.render('consultas/vwFormConsultas', {
    title: 'Formulario de consultas',
    showNavbar: true,
    activeMenu: 'consultas',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
