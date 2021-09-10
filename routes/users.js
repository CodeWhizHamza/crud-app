const router = require('express').Router()
const Joi = require('joi')
const mongoose = require('mongoose')

// USER model
const User = require('../models/User')

// Use enviornment variables
require('dotenv').config()

// Connection with DB
const connectionString =
  process.env.DB_CONNECTION_STRING ||
  `mongodb://localhost/${process.env.DB_NAME}`

mongoose.connect('mongodb://localhost/CRUD_DB')

/*
 *
 * Request types
 * GET      /users
 * GET      /users/:id
 * POST     /users [data for user in req.body]
 * DELETE   /users/:id
 * PATCH    /users/:id
 *
 */

router.get('/', async (_, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: `Something went wrong. Please try again` })
  }
})
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'Unable to find user' })
    res.json(user)
  } catch (error) {
    res.status(400).json({
      message: 'Unable to find user. (Maybe the ID is incorrect)',
    })
  }
})
router.post('/', async (req, res) => {
  const requestedUserData = req.body

  // User schema
  const userSchema = Joi.object({
    name: Joi.string().min(4).max(8).alphanum().required(),
    password: Joi.string().min(4).alphanum().required(),
  })

  // Check ID: Error if it exists
  if (requestedUserData.id)
    return res
      .status(403)
      .send({ message: `You don't have RIGHT to set ID of user.` })

  // Check user for already existence
  const alreadyExits = await User.find({ name: requestedUserData.name })
  if (alreadyExits.length != 0)
    return res.status(400).send({ message: `User already exists` })

  // Validation of user data with ** JOI **
  const { error } = userSchema.validate(requestedUserData)
  if (error) return res.status(400).send({ message: error.message })

  const newUser = await User.create({ ...requestedUserData })
  return res.status(200).json(newUser)
})
router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'Unable to find user' })

    const result = await User.findByIdAndDelete(id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({
      message: 'Unable to find user. (Maybe the ID is incorrect)',
    })
  }
})
router.patch('/:id', async (req, res) => {
  const id = req.params.id
  const requestedUserData = req.body

  const requestedUserKeys = Object.keys(requestedUserData)
  const savedUserData = await User.findById(id)

  // User doesn't exists
  if (!savedUserData)
    return res.status(404).json({ message: `User doesn't exits` })

  // If request has ID
  if (requestedUserData.id)
    return res.status(403).json({ message: `You can't change user ID` })

  // If request is empty
  if (requestedUserKeys.length == 0)
    return res.status(400).json({ message: `Please provides data to update` })

  // Schema
  const schema = Joi.object({
    name: Joi.string().min(4).max(8).alphanum(),
    password: Joi.string().min(4).alphanum(),
  })

  // Validation
  const { error } = schema.validate(requestedUserData)
  if (error) return res.status(400).json({ message: error.message })

  // Update data
  requestedUserKeys.forEach(key => {
    savedUserData[key] = requestedUserData[key]
  })

  const updatedUserData = await User.findOneAndUpdate(
    { _id: id },
    savedUserData,
  )

  return res.json(await User.findById(id))
})

module.exports = router
