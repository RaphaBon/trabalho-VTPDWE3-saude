// Rotas da API: URL -> função do controller.
//-- Arquiv routes/router.js

const express = require("express");
const routerApp = express.Router();

const appPacientes = require("../apps/pacientes/controller/ctlPacientes");
const appConsultas = require("../apps/consultas/controller/ctlConsultas");
const appLogin = require("../apps/login/controller/ctlLogin");

routerApp.use((req, res, next) => {
  next();
});

routerApp.get("/", (req, res) => {
  res.send("Olá mundo!");
});

//Rotas de Pacientes
// AutenticaJWT confere o token antes de chamar o controller.
routerApp.get("/getAllPacientes", appLogin.AutenticaJWT, appPacientes.GetAllPacientes);
routerApp.get("/getPacienteByID/:pacienteid", appLogin.AutenticaJWT, appPacientes.GetPacienteByID);
routerApp.post("/insertPaciente", appLogin.AutenticaJWT, appPacientes.InsertPaciente);
routerApp.put("/updatePaciente/:pacienteid", appLogin.AutenticaJWT, appPacientes.UpdatePaciente);
routerApp.delete("/deletePaciente/:pacienteid", appLogin.AutenticaJWT, appPacientes.DeletePaciente);

//Rotas de Consultas
routerApp.get("/getAllConsultas", appLogin.AutenticaJWT, appConsultas.GetAllConsultas);
routerApp.get("/getConsultaByID/:consultaid", appLogin.AutenticaJWT, appConsultas.GetConsultaByID);
// Pacientes para o Select2 do formulário de consultas.
routerApp.get("/getPacientesToConsultas", appLogin.AutenticaJWT, appConsultas.GetPacientesToConsultas);
routerApp.post("/insertConsulta", appLogin.AutenticaJWT, appConsultas.InsertConsulta);
routerApp.put("/updateConsulta/:consultaid", appLogin.AutenticaJWT, appConsultas.UpdateConsulta);
routerApp.delete("/deleteConsulta/:consultaid", appLogin.AutenticaJWT, appConsultas.DeleteConsulta);

// Rota Login
// Login e Logout ficam sem token.
routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

module.exports = routerApp;
