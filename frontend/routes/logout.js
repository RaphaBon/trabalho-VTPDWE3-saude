// Sair: volta ao /login, que apaga o token.
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/login');
});

module.exports = router;
