const express = require('express')
const db = require('./data/dbConfig.js')
const bcrypt = require('bcryptjs')
const server = express()
const session = require('express-session')
const restricted = require('./restricted-mw.js')

const sessionConfig = {
  name: 'batman', //sid will be the default name if none is provided
  secret: 'jokerisbetterthanthanos',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, //during development it's ok to have it as false but not in production
    httpOnly: true, //this keeps the cookie from getting accessed by a JS engine
  },
  resave: false,
  saveUninitialized: false //GDPR laws on setting cookies automatically
}

server.use(express.json())
server.use(session(sessionConfig))

server.post('/api/register/', async (req, res) => {
  const user = req.body
  const hash = bcrypt.hashSync(user.password, 12)
  user.password = hash
  try {
    const newUser = await db('users').insert(user)
    res.status(201).json(newUser)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})
server.post('/api/login/', async (req, res) => {
  const {
    username,
    password
  } = req.body
  const user = await db('users').where({
    username
  }).first()
  try {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user
      res.status(201).json({
        message: `Welcome ${user.username}`
      })
    } else {
      res.status(404).json({
        message: `Invalid credentials`
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})
server.get('/api/users/', restricted, async (req, res) => {
  try {
    const users = await db('users')
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json(500)
  }
})
server.get('/api/logout/', async (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) res.json({
        error: "error logging you out"
      })
      else res.status(200).json({
        message: "see ya"
      })
    })
  } else {
    res.status(200).json({
      message: "yeet"
    })
  }
})

module.exports = server