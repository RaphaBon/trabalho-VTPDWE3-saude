// Login: envia usuário e senha e guarda o token.
document.addEventListener('DOMContentLoaded', function() {
  // Limpa o Cookie Islogged
  dw3ClearIsLoggedCookie();
  // Ao abrir o login, descarta o token (logout).
  localStorage.removeItem('token');

  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('loginError');

  if (!form) {
    return;
  }

  // Submete os dados de Login
  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    var servidorDw3 = form.dataset.servidorDw3;
    var usuario = document.getElementById('usuario').value;
    var senha = document.getElementById('senha').value;
    var submitButton = form.querySelector('button[type="submit"]');

    if (errorBox) {
      errorBox.classList.add('d-none');
      errorBox.textContent = '';
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Entrando...';
    }

    try {
      var response = await fetch(servidorDw3 + '/Login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          username: usuario,
          password: senha
        })
      });

      if (!response.ok) {
        throw new Error('Usuário ou senha inválidos.');
      }

      var data = await response.json();
      var token = data.token || data.Token || data.accessToken || data.AccessToken;

      // Sem token: mostra a mensagem do backend.
      if (!token) {
        throw new Error(data.message || 'Token não retornado pelo servidor.');
      }

      // Guarda o token para as próximas requisições.
      localStorage.setItem('token', token);
      // Marca que há usuário logado.
      document.cookie = 'IsLogged=true; path=/'; // Usado ara verificar se o usuário está ou não logado.

      window.location.href = '/home';
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || 'Nao foi possivel realizar o login.';
        errorBox.classList.remove('d-none');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }
    }
  });
});
