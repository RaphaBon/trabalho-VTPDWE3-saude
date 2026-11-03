-- Cria o banco saude com dados de exemplo.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela pai (1:N). removido = soft delete.
CREATE TABLE IF NOT EXISTS pacientes (
    pacienteid      bigserial CONSTRAINT pk_pacientes PRIMARY KEY,
    nome            varchar(50)   NOT NULL,
    telefone        varchar(15)   NOT NULL,
    cpf             varchar(14)   NOT NULL UNIQUE,
    peso            numeric(5,2)  NOT NULL DEFAULT 0,
    datanascimento  date          NOT NULL,
    removido        boolean       DEFAULT false
);

INSERT INTO pacientes VALUES
    (default, 'Maria Aparecida Souza', '(17) 99876-5432', '123.456.789-00', 68.50, '1975-04-12'),
    (default, 'João Pedro Lima',       '(17) 98123-4567', '987.654.321-00', 82.30, '1990-09-03')
ON CONFLICT DO NOTHING;

-- Tabela filha. tipo: P = particular, C = convênio. dataretorno NULL = sem retorno.
CREATE TABLE IF NOT EXISTS consultas (
    consultaid      bigserial CONSTRAINT pk_consultas PRIMARY KEY,
    descricao       varchar(100)  NOT NULL,
    tipo            char(1)       NOT NULL CHECK (tipo IN ('P', 'C')),
    valor           numeric(12,2) NOT NULL,
    dataconsulta    date          NOT NULL,
    dataretorno     date,
    pacienteid      bigint CONSTRAINT fk_consulta_paciente REFERENCES pacientes,
    removido        boolean       DEFAULT false
);

INSERT INTO consultas VALUES
    (default, 'Cardiologia - check-up anual',  'C',   0.00, '2026-10-15', '2027-04-15',
        (SELECT pacienteid FROM pacientes WHERE cpf = '123.456.789-00')),
    (default, 'Dermatologia - avaliação',      'P', 250.00, '2026-10-20', null,
        (SELECT pacienteid FROM pacientes WHERE cpf = '123.456.789-00')),
    (default, 'Ortopedia - dor no joelho',     'P', 320.00, '2026-09-30', '2026-10-30',
        (SELECT pacienteid FROM pacientes WHERE cpf = '987.654.321-00'))
ON CONFLICT DO NOTHING;

-- Usuários do login.
CREATE TABLE IF NOT EXISTS usuarios (
    usuarioid bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username  varchar(20) UNIQUE,
    password  text,
    removido  boolean DEFAULT false
);

-- Senhas gravadas com bcrypt (crypt + gen_salt).
INSERT INTO usuarios VALUES
    (default, 'admin', crypt('admin', gen_salt('bf'))),
    (default, 'qwe',   crypt('qwe',   gen_salt('bf')))
ON CONFLICT DO NOTHING;
