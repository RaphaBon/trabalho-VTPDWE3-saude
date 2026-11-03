// SQL da tabela consultas.
//-- arquivo apps/consultas/model/mdlConsultas.js

const db = require("../../../database/databaseconfig");

// Consultas ativas por data da consulta; o subselect traz "nome - cpf".
const GetAllConsultas = async () => {
  return (
    await db.query(
      "SELECT *, (SELECT nome || ' - ' || cpf from PACIENTES where pacienteid = consultas.pacienteid) AS paciente " +
        "FROM consultas where removido = false ORDER BY dataconsulta ASC"
    )
  ).rows;
};

// Consulta pelo ID ($1).
const GetConsultaByID = async (consultaIDPar) => {
  return (
    await db.query(
      "SELECT *, (SELECT nome || ' - ' || cpf from PACIENTES where pacienteid = consultas.pacienteid) AS paciente " +
        "FROM consultas WHERE consultaid = $1 and removido = false ORDER BY dataconsulta ASC",
      [consultaIDPar]
    )
  ).rows;
};

// Pacientes ativos para o Select2.
const GetPacientesToConsultas = async () => {
  return (
    await db.query(
      "select pacienteid, nome, cpf from pacientes where removido = false"
    )
  ).rows;
};

// Insere e devolve { msg, linhasAfetadas }.
const InsertConsulta = async (consultaREGPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornor erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO consultas " + "values(default, $1, $2, $3, $4, $5, $6, $7)",
        [
          consultaREGPar.descricao,
          consultaREGPar.tipo,
          consultaREGPar.valor,
          consultaREGPar.dataconsulta,
          // Data vazia vira NULL (sem retorno).
          consultaREGPar.dataretorno || null,
          consultaREGPar.pacienteid,
          consultaREGPar.removido,
        ]
      )
    ).rowCount;
  // Erro do banco (ex.: tipo fora de P/C): mensagem e -1.
  } catch (error) {
    msg = "[mdlConsultas|InsertConsulta] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

// Atualiza a consulta ($1 = ID).
const UpdateConsulta = async (consultaIDPar, consultaREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE consultas SET " +
          "descricao = $2, " +
          "tipo = $3, " +
          "valor = $4, " +
          "dataconsulta = $5, " +
          "dataretorno = $6, " +
          "pacienteid = $7, " +
          "removido = $8 " +
          "WHERE consultaid = $1",
        [
           consultaIDPar,
          consultaREGPar.descricao,
          consultaREGPar.tipo,
          consultaREGPar.valor,
          consultaREGPar.dataconsulta,
          consultaREGPar.dataretorno || null,
          consultaREGPar.pacienteid,
          consultaREGPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlConsultas|UpdateConsulta] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

// Soft delete: marca removido = true em vez de apagar.
const DeleteConsulta = async (consultaIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
    await db.query(
      "UPDATE consultas SET " + "removido = true " + "WHERE consultaid = $1",
      [consultaIDPar]
    )
  ).rowCount;
} catch (error) {
  msg = "[mdlConsultas|DeleteConsulta] " + (error.detail || error.message);
  linhasAfetadas = -1;
}

return { msg, linhasAfetadas };
};

module.exports = {
  GetAllConsultas,
  GetConsultaByID,
  GetPacientesToConsultas,
  InsertConsulta,
  UpdateConsulta,
  DeleteConsulta,
};
