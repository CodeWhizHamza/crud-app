// Packages to include
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')
const usersRoute = require('./routes/users')

const app = express()
dotenv.config()

// Middlewares
app.use(express.json())

// Connection with DB
const connectionString =
  process.env.DB_CONNECTION_STRING ||
  `mongodb://localhost/${process.env.DB_NAME}`

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Server Listening
    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`)
    })
    console.log(
      `Connected to DB successfully on ${new Date().getFullYear}/${
        new Date().getMonth() + 1
      }/${new Date().getDay()}`,
    )
  })
  .catch(error => {
    console.log(error)
  })

// Constants
const PORT = process.env.PORT || 5000

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`))
})
app.use('/users', usersRoute)
