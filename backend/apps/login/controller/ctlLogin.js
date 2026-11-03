// Login, geração do token e proteção das rotas.
//-- apps/login/controller/ctlLogin.js
const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

// Confere usuário e senha e devolve o token.
const Login = async (req, res, next) => {
  const credencial = await mdlLogin.GetCredencial(req.body.username);
  if (credencial.length == 0) {
    return res.status(200).json({ message: "Usuário não identificado!" });
  }
  // Compara a senha digitada com o hash bcrypt do banco.
  if (bCrypt.compareSync(req.body.password, credencial[0].password)) {
    //auth ok
    const username = credencial[0].username;
    // Token JWT com o username, válido por 10 minutos.
    const token = jwt.sign({ username }, process.env.SECRET_API, {
      expiresIn: 600, // expires in 10min
    });
    return res.json({ auth: true, token: token });
  }
  res.status(200).json({ message: "Login inválido!" });
};

// Middleware: só deixa passar com token válido no Authorization.
function AutenticaJWT(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  if (!tokenHeader)
    return res
      .status(200)
      .json({ auth: false, message: "Não foi informado o token JWT" });
  const bearer = tokenHeader.split(" ");
  const token = bearer[1];
  // Confere assinatura e validade do token.
  jwt.verify(token, process.env.SECRET_API, function (err, decoded) {
    if (err)
      return res
        .status(200)
        .json({ auth: false, message: "JWT inválido ou expirado" });
    // Token ok: guarda o usuário e segue (next).
    req.username = decoded.username;
    next();
  });
}

// O token é descartado pelo front; aqui só responde.
const Logout = (req, res, next) => {
  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};
