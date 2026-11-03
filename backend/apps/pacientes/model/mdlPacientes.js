// SQL da tabela pacientes.
const db = require("../../../database/databaseconfig");

// Pacientes não removidos, por nome.
const GetAllPacientes = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM pacientes where removido = false ORDER BY nome ASC"
    )
  ).rows;
};

// Paciente pelo ID ($1 = parâmetro, evita SQL Injection).
const GetPacienteByID = async (pacienteIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM pacientes WHERE pacienteid = $1 and removido = false ORDER BY nome ASC",
      [pacienteIDPar]
    )
  ).rows;
};

// Insere e devolve { msg, linhasAfetadas }.
const InsertPaciente = async (registroPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornor erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pacientes " + "values(default, $1, $2, $3, $4, $5, $6)",
        [
          registroPar.nome,
          registroPar.telefone,
          registroPar.cpf,
          registroPar.peso,
          registroPar.datanascimento,
          registroPar.removido,
        ]
      )
    ).rowCount;
  // Erro do banco: devolve a mensagem e -1.
  } catch (error) {
    msg = "[mdlPacientes|InsertPaciente] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

// Atualiza o paciente ($1 = ID).
const UpdatePaciente = async (pacienteIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pacientes SET " +
          "nome = $2, " +
          "telefone = $3, " +
          "cpf = $4, " +
          "peso = $5, " +
          "datanascimento = $6, " +
          "removido = $7 " +
          "WHERE pacienteid = $1",
        [
            pacienteIDPar,
            registroPar.nome,
            registroPar.telefone,
            registroPar.cpf,
            registroPar.peso,
            registroPar.datanascimento,
            registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPacientes|UpdatePaciente] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};


const DeletePaciente = async (pacienteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
    await db.query(
      "UPDATE pacientes SET " + "removido = true " + "WHERE pacienteid = $1",
      [pacienteIDPar]
    )
  ).rowCount;
} catch (error) {
  msg = "[mdlPacientes|DeletePaciente] " + (error.detail || error.message);
  linhasAfetadas = -1;
}

return { msg, linhasAfetadas };
};


module.exports = {
  GetAllPacientes,
  GetPacienteByID,
  InsertPaciente,
  UpdatePaciente,
  DeletePaciente,
};
