# Clínica Saúde — Trabalho DW3

Sistema Cliente-Servidor com CRUD de duas tabelas relacionadas, que representa o módulo de atendimento de uma clínica de saúde.

- **Pacientes** (`pacientes`): nome, telefone, CPF, peso e data de nascimento.
- **Consultas** (`consultas`): consultas particulares (`P`) e de convênio (`C`), com valor, data da consulta, retorno (vazio = sem retorno) e o paciente.
- Relação **1:N**: um paciente tem várias consultas.
- Exclusão lógica (soft delete) pelo campo `removido`.
- Login com JWT. Todas as rotas de dados exigem token.

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Banco | PostgreSQL (extensão `pgcrypto` para as senhas em bcrypt) |
| Backend | Node.js, Express 4, pg, jsonwebtoken, bcryptjs, body-parser, dotenv |
| Frontend | Node.js, Express 5, Nunjucks, dotenv; no navegador: Bootstrap 5, DataTables, Select2 e jQuery (via CDN) |

## Estrutura

```
backend/    API REST (porta 40000)
  apps/login, apps/pacientes, apps/consultas   (controller + model)
  database/databaseConfig.sql                   (script do banco)
  routes/router.js
  tests/*.rest                                  (testes para o REST Client do VS Code)
frontend/   Telas (porta 40100)
  apps/login, apps/home, apps/pacientes, apps/consultas  (views .njk + .js)
  routes/, views/, public/
```

## 1. Criar o banco

Com o PostgreSQL rodando, crie o banco e execute o script **uma única vez** (executá-lo de novo duplica as consultas):

```bash
psql -h localhost -U postgres -c "CREATE DATABASE saude;"
psql -h localhost -U postgres -d saude -f backend/database/databaseConfig.sql
```

O script cria as tabelas `pacientes`, `consultas` e `usuarios` com dados de exemplo.

## 2. Configurar os arquivos .env

Os arquivos reais de configuração não vão para o repositório. Copie os exemplos e ajuste:

```bash
cp backend/.env.example backend/.env
cp frontend/dw3frontend.env.example frontend/dw3frontend.env
```

`backend/.env`:

```
APP_NAME=saude_ServidorBackend
SECRET_API=troque_por_um_valor_aleatorio_forte
DB_NAME=saude
DB_USER=postgres
DB_PASS=sua_senha_do_postgres
DB_HOST=localhost
DB_PORT=5432
```

- `SECRET_API`: chave usada para assinar o JWT. Pode ser gerada com `openssl rand -base64 48`.
- `DB_HOST=localhost` quando o backend roda com `node app.js` na própria máquina. Se o backend rodar dentro de um container Docker e o banco no host, use `DB_HOST=172.17.0.1`.

`frontend/dw3frontend.env`:

```
APP_NAME=saudeFrontEnd
PORT=40100
SERVIDOR_DW3=http://localhost:40000
```

## 3. Rodar

Em dois terminais:

```bash
# Backend — http://localhost:40000
cd backend
npm install
node app.js
```

```bash
# Frontend — http://localhost:40100
cd frontend
npm install
node app.js
```

Acesse **http://localhost:40100** e entre com o usuário de teste:

| Usuário | Senha |
|---|---|
| `qwe` | `qwe` |

(também existe `admin` / `admin`). O token expira em 10 minutos.

## APIs do backend

Todas as rotas, exceto `/Login` e `/Logout`, exigem o cabeçalho `Authorization: Bearer <token>`. Sem token válido a resposta é `{ "auth": false, "message": "..." }`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/Login` | Body `{ "username", "password" }` → `{ auth: true, token }` |
| POST | `/Logout` | Encerra a sessão → `{ auth: false, token: null }` |
| GET | `/getAllPacientes` | Lista os pacientes não removidos, ordenados por nome |
| GET | `/getPacienteByID/:pacienteid` | Busca um paciente |
| POST | `/insertPaciente` | Inclui um paciente |
| PUT | `/updatePaciente/:pacienteid` | Altera um paciente |
| DELETE | `/deletePaciente/:pacienteid` | Remove (lógico) um paciente |
| GET | `/getAllConsultas` | Lista as consultas não removidas, ordenadas por data da consulta, com o paciente (`nome - cpf`) |
| GET | `/getConsultaByID/:consultaid` | Busca uma consulta |
| GET | `/getPacientesToConsultas` | Pacientes ativos para o select do formulário de consultas |
| POST | `/insertConsulta` | Inclui uma consulta (`dataretorno` vazio grava NULL) |
| PUT | `/updateConsulta/:consultaid` | Altera uma consulta |
| DELETE | `/deleteConsulta/:consultaid` | Remove (lógico) uma consulta |

Respostas: buscas retornam `{ status: "ok", registro: [...] }`; inclusões, alterações e remoções retornam `{ status, linhasAfetadas }` (em caso de erro, `status` traz a mensagem do banco e `linhasAfetadas` é `-1`).

Exemplos de requisições prontas estão em `backend/tests/` (extensão REST Client do VS Code).
