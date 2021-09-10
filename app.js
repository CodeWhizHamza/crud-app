// Packages to include
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const usersRoute = require('./routes/users')

const app = express()
dotenv.config()

// Middlewares
app.use(express.json())

// Constants
const PORT = process.env.PORT || 5000

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`))
})
app.use('/users', usersRoute)

// Server Listening
app.listen(PORT)
