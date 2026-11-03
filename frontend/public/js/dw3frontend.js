// Funções comuns de login e sessão.
// Sem o cookie IsLogged, manda para o login.
function dw3IsLogged() {
  const isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (!isLogged) {
    window.location.href = '/login';
    return false;
  }

  return true;
}


// Apaga o cookie IsLogged.
function dw3ClearIsLoggedCookie() {
  // Limpa o Cookie Islogged
  var isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (isLogged) {
    document.cookie = 'IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

// Adiciona Authorization: Bearer <token do localStorage>.
function dw3MontarHeadersAutenticacao(headers) {
  var token = localStorage.getItem('token');
  var finalHeaders = headers || {};

  if (token) {
    finalHeaders.Authorization = 'Bearer ' + token;
  }

  return finalHeaders;
}

// Usada quando o backend responde { auth: false } (token ausente, inválido ou expirado).
// Avisa, limpa token e cookie e volta ao login.
function dw3SessaoExpirada(mensagem) {
  alert(mensagem);
  localStorage.removeItem('token');
  dw3ClearIsLoggedCookie();
  window.location.href = '/login';
}

function dw3OcultarBotao(id) {
  var botao = document.getElementById(id);

  if (botao) {
    botao.classList.add('d-none');
  }
}
