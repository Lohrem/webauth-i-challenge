const express = require('express')
const db = require('./data/dbConfig.js')
// const router = express.Router()
const bcrypt = require('bcryptjs')
const server = express()

server.use(express.json())

let isLoggedIn = false
server.post('/api/register/', async (req, res) => {
  const user = req.body
  const hash = bcrypt.hashSync(user.password, 12)
  user.password = hash
  try {
    const newUser = await db('users').insert(user)
    res.status(201).json(newUser)
    isLoggedIn = false
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})
server.post('/api/login/', async (req, res) => {
  const { username, password } = req.body
  const user = await db('users').where({username}).first()
  isLoggedIn = true
  try {
    if (user && bcrypt.compareSync(password, user.password) && isLoggedIn) {
      res.status(201).json({
        message: `Welcome ${user.username}`
      })
    } else {
      isLoggedIn = false
      res.status(404).json({
        message: `Invalid credentials`
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})
server.get('/api/users/', async (req, res) => {
  try {
    if(isLoggedIn) {
      const users = await db('users')
      res.status(200).json(users)
    }
    else {
      res.status(403).json({
        message: "You must be logged in"
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(500)
  }
})

module.exports = server
