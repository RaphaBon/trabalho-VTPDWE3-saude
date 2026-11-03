// Formulário de consultas: age conforme ?oper= da URL.
document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmConsultas');

  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var servidorDw3 = form.dataset.servidorDw3;
  var btnInserir = document.getElementById('btnInserirConsulta');
  var btnAtualizar = document.getElementById('btnAtualizarConsulta');

  // Ativa o Select2 no paciente.
  inicializarSelectPacientes();

  // Cr: incluir.
  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none'); // Torna o Botão visível.
    carregarPacientesToConsultas(servidorDw3);
  }

  // Re: visualizar, com campos desabilitados.
  if (oper === 'Re') {
    // Modo visualizar: todos os campos ficam desabilitados.
    form.querySelectorAll('input, select').forEach(function(campo) {
      campo.disabled = true;
    });
    vwGetConsultaByID();
  }

  // Up: atualizar.
  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetConsultaByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdateConsulta();
    });
  }


  // De: remover.
  if (oper === 'De') {
    var btnRemover = document.getElementById('btnRemoverConsulta');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetConsultaByID());
    btnRemover.addEventListener('click', function() {
      vwDeleteConsulta();
    });
  }

  if (btnInserir) {
    btnInserir.addEventListener('click', function() {
      vwInsertConsulta();
    });
  }
});

// Aqui é inicializado o componente Select2.js em branco
function inicializarSelectPacientes() {
  $('#pacienteid').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um paciente',
    width: '100%'
  });
}

// Aqui é preenchido o componente Select2 com os pacientes disponíveis
// GET /getPacientesToConsultas com o token.
async function carregarPacientesToConsultas(servidorDw3) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend nao configurado.');
    }

    var response = await fetch(servidorDw3 + '/getPacientesToConsultas', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possivel carregar os pacientes.');
    }

    var data = await response.json();

    // Sessão expirada: volta ao login.
    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessão expirada. Faca login novamente.');
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta invalida do servidor backend.');
    }

    preencherSelectPacientes(data.registro);
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar pacientes.');
    return false;
  }
}

// Uma opção por paciente: "nome - cpf".
function preencherSelectPacientes(pacientes) {
  var pacienteSelect = document.getElementById('pacienteid');

  if (!pacienteSelect) {
    return;
  }

  pacienteSelect.innerHTML = '<option value="">Selecione um paciente</option>';

  pacientes.forEach(function(paciente) {
    var option = document.createElement('option');
    option.value = paciente.pacienteid;
    option.textContent = paciente.nome + ' - ' + paciente.cpf;
    pacienteSelect.appendChild(option);
  });

  $('#pacienteid').trigger('change');
}

// POST /insertConsulta.
async function vwInsertConsulta() {
  var form = document.getElementById('frmConsultas');
  var btnInserir = document.getElementById('btnInserirConsulta');

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    if (btnInserir) {
      btnInserir.disabled = true;
    }

    // Envia o token no Authorization e os dados em JSON.
    var response = await fetch(servidorDw3 + '/insertConsulta', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarConsultaDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel inserir a consulta.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel inserir a consulta.');
    }

    window.location.href = '/consultas';
  } catch (error) {
    alert(error.message || 'Erro ao inserir consulta.');
  } finally {
    if (btnInserir) {
      btnInserir.disabled = false;
    }
  }
}


// Busca a consulta e preenche o formulário.
async function vwGetConsultaByID() {
  var form = document.getElementById('frmConsultas');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var consultaId = parametros.get('consultaId');
    var servidorDw3 = form.dataset.servidorDw3;

    if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
      throw new Error('ID da consulta invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    var response = await fetch(servidorDw3 + '/getConsultaByID/' + encodeURIComponent(consultaId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar a consulta.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta invalida do servidor backend.');
    }

    var consulta = data.registro[0];

    if (!consulta) {
      throw new Error('Consulta nao encontrada.');
    }

    document.getElementById('consultaid').value = consulta.consultaid;
    document.getElementById('descricao').value = consulta.descricao ?? '';
    document.getElementById('tipo').value = consulta.tipo ?? '';
    document.getElementById('valor').value = consulta.valor ?? '';
    document.getElementById('dataconsulta').value = consulta.dataconsulta ? consulta.dataconsulta.slice(0, 10) : '';
    document.getElementById('dataretorno').value = consulta.dataretorno ? consulta.dataretorno.slice(0, 10) : '';
    document.getElementById('removido').value = String(consulta.removido === true);

    if (!(await carregarPacientesToConsultas(servidorDw3))) {
      return false;
    }
    // Seleciona o paciente no Select2.
    $('#pacienteid').val(consulta.pacienteid).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar consulta.');
    return false;
  }
}




// PUT /updateConsulta/:id.
async function vwUpdateConsulta() {
  var form = document.getElementById('frmConsultas');
  var btnAtualizar = document.getElementById('btnAtualizarConsulta');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var consultaId = new URLSearchParams(window.location.search).get('consultaId');
    var servidorDw3 = form.dataset.servidorDw3;

    if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
      throw new Error('ID da consulta invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    btnAtualizar.disabled = true;

    var consulta = montarConsultaDoFormulario();
    consulta.valor = Number(consulta.valor);
    consulta.pacienteid = Number(consulta.pacienteid);

    var response = await fetch(servidorDw3 + '/updateConsulta/' + encodeURIComponent(consultaId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(consulta)
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel atualizar a consulta.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel atualizar a consulta.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma consulta foi atualizada.');
    }

    alert('Consulta atualizada com sucesso.');
  } catch (error) {
    alert(error.message || 'Erro ao atualizar consulta.');
  } finally {
    btnAtualizar.disabled = false;
  }
}


// DELETE /deleteConsulta/:id (soft delete).
async function vwDeleteConsulta() {
  var form = document.getElementById('frmConsultas');
  var btnRemover = document.getElementById('btnRemoverConsulta');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção desta consulta?')) {
    return;
  }

  try {
    var consultaId = document.getElementById('consultaid').value;
    var servidorDw3 = form.dataset.servidorDw3;

    if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
      throw new Error('ID da consulta invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deleteConsulta/' + encodeURIComponent(consultaId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel remover a consulta.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel remover a consulta.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma consulta foi removida.');
    }

    window.location.href = '/consultas';
  } catch (error) {
    alert(error.message || 'Erro ao remover consulta.');
  } finally {
    btnRemover.disabled = false;
  }
}




// Monta o objeto com os campos do formulário.
function montarConsultaDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value,
    tipo: document.getElementById('tipo').value,
    valor: document.getElementById('valor').value,
    dataconsulta: document.getElementById('dataconsulta').value,
    dataretorno: document.getElementById('dataretorno').value,
    pacienteid: document.getElementById('pacienteid').value,
    removido: document.getElementById('removido').value === 'true'
  };
}
