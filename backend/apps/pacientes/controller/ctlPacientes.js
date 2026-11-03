// Controller de pacientes: chama o model e responde em JSON.
const mdlPacientes = require("../model/mdlPacientes");

// Responde { status: "ok", registro }.
const GetAllPacientes = (req, res) =>
  (async () => {
    let registro = await mdlPacientes.GetAllPacientes();
    res.json({ status: "ok", registro: registro });
  })();

// ID vem da URL (req.params).
const GetPacienteByID = (req, res) =>
  (async () => {
    const pacienteID = parseInt(req.params.pacienteid);
    let registro = await mdlPacientes.GetPacienteByID(pacienteID);

    res.json({ status: "ok", registro: registro });
  })();

// Dados vêm do corpo; responde { status, linhasAfetadas }.
const InsertPaciente = (request, res) =>
  (async () => {
    const registro = request.body;
    let { msg, linhasAfetadas } = await mdlPacientes.InsertPaciente(registro);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

// ID pela URL, dados pelo corpo.
const UpdatePaciente = (request, res) =>
  (async () => {
    const pacienteID = parseInt(request.params.pacienteid);
    const registro = request.body;
    let { msg, linhasAfetadas } = await mdlPacientes.UpdatePaciente(pacienteID, registro);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

// Remove (soft delete) pelo ID da URL.
const DeletePaciente = (request, res) =>
  (async () => {
    const pacienteID = parseInt(request.params.pacienteid);
    let { msg, linhasAfetadas } = await mdlPacientes.DeletePaciente(pacienteID);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

module.exports = {
  GetAllPacientes,
  GetPacienteByID,
  InsertPaciente,
  UpdatePaciente,
  DeletePaciente
};
