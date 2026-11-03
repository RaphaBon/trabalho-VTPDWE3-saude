// Servidor do front: entrega as telas Nunjucks e os arquivos JS/CSS.

//-- app.js
//-- Para rodar: node app.js

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var nunjucks = require('nunjucks');

var indexRouter = require('./routes/rtIndex');
var loginRouter = require('./routes/rtLogin');
var homeRouter = require('./routes/rtHome');
var pacientesRouter = require('./routes/rtPacientes');
var consultasRouter = require('./routes/rtConsultas');
var logoutRouter = require('./routes/logout');

// Lê PORT e SERVIDOR_DW3 do dw3frontend.env.
require('dotenv').config({ path: path.join(__dirname, 'dw3frontend.env'), quiet: true });

var app = express();
var viewsPath = path.join(__dirname, 'views');
var appsPath = path.join(__dirname, 'apps');
const port = process.env.PORT || 40100;
app.set('views', [viewsPath, appsPath]);
app.set('view engine', 'njk');

nunjucks.configure([viewsPath, appsPath], {
  autoescape: true,
  express: app,
  noCache: app.get('env') === 'development'
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Serve public/ e apps/ direto ao navegador.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/apps', express.static(path.join(__dirname, 'apps')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/pacientes', pacientesRouter);
app.use('/consultas', consultasRouter);
app.use('/logout', logoutRouter);

// Nenhuma rota atendeu: erro 404.
app.use(function(req, res, next) {
  next(createError(404));
});

// Mostra os erros com views/error.njk.
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', { title: 'Erro' });
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
