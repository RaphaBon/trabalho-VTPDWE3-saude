// Formulário de pacientes: age conforme ?oper= da URL.
document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPacientes');

  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var btnInserir = document.getElementById('btnInserirPaciente');
  var btnAtualizar = document.getElementById('btnAtualizarPaciente');

  // Cr: incluir.
  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none'); // Torna o Botão visível.
  }

  // Re: visualizar, com campos desabilitados.
  if (oper === 'Re') {
    // Modo visualizar: todos os campos ficam desabilitados.
    form.querySelectorAll('input, select').forEach(function(campo) {
      campo.disabled = true;
    });
    vwGetPacienteByID();
  }

  // Up: atualizar.
  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetPacienteByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePaciente();
    });
  }


  // De: remover.
  if (oper === 'De') {
    var btnRemover = document.getElementById('btnRemoverPaciente');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetPacienteByID());
    btnRemover.addEventListener('click', function() {
      vwDeletePaciente();
    });
  }

  if (btnInserir) {
    btnInserir.addEventListener('click', function() {
      vwInsertPaciente();
    });
  }
});

// POST /insertPaciente.
async function vwInsertPaciente() {
  var form = document.getElementById('frmPacientes');
  var btnInserir = document.getElementById('btnInserirPaciente');

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
    var response = await fetch(servidorDw3 + '/insertPaciente', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(montarPacienteDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel inserir o paciente.');
    }

    var data = await response.json();

    // Sessão expirada: volta ao login.
    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel inserir o paciente.');
    }

    window.location.href = '/pacientes';
  } catch (error) {
    alert(error.message || 'Erro ao inserir paciente.');
  } finally {
    if (btnInserir) {
      btnInserir.disabled = false;
    }
  }
}


// Busca o paciente e preenche o formulário.
async function vwGetPacienteByID() {
  var form = document.getElementById('frmPacientes');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var pacienteId = parametros.get('pacienteId');
    var servidorDw3 = form.dataset.servidorDw3;

    if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
      throw new Error('ID do paciente invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    var response = await fetch(servidorDw3 + '/getPacienteByID/' + encodeURIComponent(pacienteId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar o paciente.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta invalida do servidor backend.');
    }

    var paciente = data.registro[0];

    if (!paciente) {
      throw new Error('Paciente nao encontrado.');
    }

    document.getElementById('pacienteid').value = paciente.pacienteid;
    document.getElementById('nome').value = paciente.nome ?? '';
    document.getElementById('telefone').value = paciente.telefone ?? '';
    document.getElementById('cpf').value = paciente.cpf ?? '';
    document.getElementById('peso').value = paciente.peso ?? '';
    document.getElementById('datanascimento').value = paciente.datanascimento ? paciente.datanascimento.slice(0, 10) : '';
    document.getElementById('removido').value = String(paciente.removido === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar paciente.');
    return false;
  }
}




// PUT /updatePaciente/:id.
async function vwUpdatePaciente() {
  var form = document.getElementById('frmPacientes');
  var btnAtualizar = document.getElementById('btnAtualizarPaciente');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var pacienteId = new URLSearchParams(window.location.search).get('pacienteId');
    var servidorDw3 = form.dataset.servidorDw3;

    if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
      throw new Error('ID do paciente invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    btnAtualizar.disabled = true;

    var paciente = montarPacienteDoFormulario();
    paciente.peso = Number(paciente.peso);

    var response = await fetch(servidorDw3 + '/updatePaciente/' + encodeURIComponent(pacienteId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(paciente)
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel atualizar o paciente.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel atualizar o paciente.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum paciente foi atualizado.');
    }

    alert('Paciente atualizado com sucesso.');
  } catch (error) {
    alert(error.message || 'Erro ao atualizar paciente.');
  } finally {
    btnAtualizar.disabled = false;
  }
}


// DELETE /deletePaciente/:id (soft delete).
async function vwDeletePaciente() {
  var form = document.getElementById('frmPacientes');
  var btnRemover = document.getElementById('btnRemoverPaciente');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste paciente?')) {
    return;
  }

  try {
    var pacienteId = document.getElementById('pacienteid').value;
    var servidorDw3 = form.dataset.servidorDw3;

    if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
      throw new Error('ID do paciente invalido.');
    }

    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deletePaciente/' + encodeURIComponent(pacienteId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel remover o paciente.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Nao foi possivel remover o paciente.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum paciente foi removido.');
    }

    window.location.href = '/pacientes';
  } catch (error) {
    alert(error.message || 'Erro ao remover paciente.');
  } finally {
    btnRemover.disabled = false;
  }
}




// Monta o objeto com os campos do formulário.
function montarPacienteDoFormulario() {
  return {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    cpf: document.getElementById('cpf').value,
    peso: document.getElementById('peso').value,
    datanascimento: document.getElementById('datanascimento').value,
    removido: document.getElementById('removido').value === 'true'
  };
}
