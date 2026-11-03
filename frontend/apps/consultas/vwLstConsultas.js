// Listagem de consultas: busca na API e monta o DataTable.
document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('consultasListagem');
  var alertBox = document.getElementById('consultasAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesConsultas(alertBox);
  carregarConsultas(servidorDw3, alertBox);
});

// GET /getAllConsultas.
async function carregarConsultas(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    // Envia o token no Authorization.
    var response = await fetch(servidorDw3 + '/getAllConsultas', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar a lista de consultas.');
    }

    var data = await response.json();

    // Token inválido ou expirado: volta ao login.
    if (data.auth === false) {
      dw3SessaoExpirada(data.message || 'Sessao expirada. Faca login novamente.');
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta invalida do servidor backend.');
    }

    inicializarTabelaConsultas(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar consultas.');
    inicializarTabelaConsultas([]);
  }
}

// Cria o DataTable; columns liga cada coluna a um campo.
function inicializarTabelaConsultas(consultas) {
  new DataTable('#tblConsultas', {
    data: consultas,
    columns: [
      { data: 'consultaid', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
      {
        data: 'tipo',
        defaultContent: '',
        // P -> Particular, C -> Convênio.
        render: function(data) {
          if (data === 'P') {
            return 'Particular';
          }

          if (data === 'C') {
            return 'Convênio';
          }

          return '';
        }
      },
      {
        data: 'valor',
        defaultContent: '',
        // Formata em R$.
        render: function(data) {
          if (data === null || data === undefined || data === '') {
            return '';
          }

          return Number(data).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        }
      },
      {
        data: 'dataconsulta',
        defaultContent: '',
        // AAAA-MM-DD -> dd/mm/aaaa.
        render: function(data) {
          if (!data) {
            return '';
          }

          return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        }
      },
      {
        data: 'dataretorno',
        defaultContent: '',
        // Sem data de retorno = sem retorno.
        render: function(data) {
          if (!data) {
            return 'Sem retorno';
          }

          return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        }
      },
      { data: 'paciente', defaultContent: '' },
      {
        data: null,
        orderable: false,
        searchable: false,
        // Botões visualizar, atualizar e remover.
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var consultaId = escaparHtml(row.consultaid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operacoes da consulta">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-consultaid="' + consultaId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-consultaid="' + consultaId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-consultaid="' + consultaId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: {
      emptyTable: 'Nenhuma consulta cadastrada.',
      info: 'Mostrando _START_ ate _END_ de _TOTAL_ registros',
      infoEmpty: 'Mostrando 0 ate 0 de 0 registros',
      infoFiltered: '(filtrado de _MAX_ registros no total)',
      lengthMenu: 'Mostrar _MENU_ registros',
      loadingRecords: 'Carregando...',
      processing: 'Processando...',
      search: 'Pesquisar:',
      zeroRecords: 'Nenhum registro encontrado',
      paginate: {
        first: 'Primeiro',
        last: 'Ultimo',
        next: 'Proximo',
        previous: 'Anterior'
      }
    }
  });
}

// Abre o formulário com a oper do botão clicado (Re, Up, De).
function configurarOperacoesConsultas(alertBox) {
  var tabela = document.getElementById('tblConsultas');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-consultaid]');

    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var consultaId = botao.dataset.consultaid;

    if (action === 'visualizar') {
      window.location.href = '/consultas/form?oper=Re&consultaId=' + encodeURIComponent(consultaId);
      return;
    }

    if (action === 'atualizar') {
      window.location.href = '/consultas/form?oper=Up&consultaId=' + encodeURIComponent(consultaId);
      return;
    }

    if (action === 'remover') {
      window.location.href = '/consultas/form?oper=De&consultaId=' + encodeURIComponent(consultaId);
    }
  });
}

function exibirAviso(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-danger');
  alertBox.classList.add('alert-info');
  alertBox.classList.remove('d-none');
}

// Evita que o valor vire HTML.
function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-info');
  alertBox.classList.add('alert-danger');
  alertBox.classList.remove('d-none');
}
