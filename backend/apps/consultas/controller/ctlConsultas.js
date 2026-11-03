// Controller de consultas: chama o model e responde em JSON.
//-- arquivo apps/consultas/controller/ctlConsultas.js

const mdlConsultas = require("../model/mdlConsultas");

// Responde { status: "ok", registro }.
const GetAllConsultas = (req, res) =>
  (async () => {
    let registro = await mdlConsultas.GetAllConsultas();
    res.json({ status: "ok", "registro": registro });
  })();

// ID vem da URL (req.params).
const GetConsultaByID = (req, res) =>
  (async () => {
    const consultaID = parseInt(req.params.consultaid);
    let registro = await mdlConsultas.GetConsultaByID(consultaID);


    res.json({ status: "ok", "registro": registro });
  })();

// Pacientes para o select do formulário.
const GetPacientesToConsultas = (req, res) =>
  (async () => {
    let registro = await mdlConsultas.GetPacientesToConsultas();
    res.json({ status: "ok", "registro": registro });
  })();

// Dados vêm do corpo; responde { status, linhasAfetadas }.
const InsertConsulta = (request, res) =>
  (async () => {
    //@ Atenção: aqui já começamos a utilizar a variável msg para retornar erros de banco de dados.
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.InsertConsulta(consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

// ID pela URL, dados pelo corpo.
const UpdateConsulta = (request, res) =>
  (async () => {
    const consultaID = parseInt(request.params.consultaid);
    const consultaREG = request.body;
    let { msg, linhasAfetadas } = await mdlConsultas.UpdateConsulta(consultaID, consultaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

// Remove (soft delete) pelo ID da URL.
const DeleteConsulta = (request, res) =>
  (async () => {
    const consultaID = parseInt(request.params.consultaid);
    let { msg, linhasAfetadas } = await mdlConsultas.DeleteConsulta(consultaID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllConsultas,
  GetConsultaByID,
  GetPacientesToConsultas,
  InsertConsulta,
  UpdateConsulta,
  DeleteConsulta
};
