const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
var cors = require('cors');
const jwt = require('jsonwebtoken')

const server = jsonServer.create()
const router = jsonServer.router('./db.json')
const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'))

server.use(jsonServer.defaults());
server.use(bodyParser.json())
server.use(cors({ origin: true, credentials: true }));

const SECRET_KEY = "1231923618723618273618237618273A"
const expiresIn = "8h"

// Create a token from a payload
function createToken(payload){
  return jwt.sign(payload, SECRET_KEY, {expiresIn})
}

// Verify the token
function verifyToken(token){
  return  jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err)
}

// Check if the user exists in database
function isAuthenticated({email, password}){
  return userdb.users.findIndex(user => user.email === email && user.password === password)
}

server.post('/api/login', (req, res) => {
  const {email, password} = req.body
  const userIdx = isAuthenticated({email, password})
  if (userIdx < 0) {
    const status = 422
    const message = 'E-mail e ou senha incorretos'
    res.status(status).json({status, message})
    return
  }

  const user = userdb.users[userIdx]
  const api_token = createToken({email, password})
  res.status(200).json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      expiry: user.expiry,
      percentage: user.percentage,
      api_token: api_token
    }
  })
})

eval(fs.readFileSync('methods.js') + '');

server.use(/^(?!\/api\/login).*$/,  (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Você não tem permissão para acessar o recurso solicitado'
    res.status(status).json({status, message})
    return
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1])
    next()
  } catch (err) {
    const status = 401
    const message = 'Sessão expirada ou token inválido'
    res.status(status).json({status, message})
  }
})

server.use('/api', router)

server.listen(3000, () => {
  console.log('Run Auth API Server')
})
