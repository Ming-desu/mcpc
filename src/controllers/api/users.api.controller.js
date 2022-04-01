const { Request, Response } = require('express')
const bcrypt = require('bcrypt')

const User = require('../../models/User')
const { BASE_URL } = require('../../../config')

/**
 * Read users from the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.read = async function(req, res) {
  const q = req.query.q || ''
  const page = req.query.page || 1
  const limit = 15

  try {
    const users = await User.find({
      $or: [
        { first_name: new RegExp(q) },
        { last_name: new RegExp(q) },
        { username: new RegExp(q) }
      ],
      _id: {
        $ne: res.locals.current_user._id
      }
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort('-updated_at')
      .select('-password -password_salt')

    res.status(200).json({
      message: 'ok',
      sub: users
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message,
      sub: []
    })
  }
}

/**
 * Store user in the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.store = async function(req, res) {
  try {
    const {
      first_name,
      last_name,
      sex,
      username,
      password
    } = req.body

    if (req.header('Referer') == `${BASE_URL}/admin/auth/register`) {
      const users = await User.find({}).limit(1)

      console.log(users)

      if (users.length > 0) {
        throw new Error('Your account cannot be registered, please contact the administrator for your account creation.')
      }
    }

    const user = await User.find({ username }).limit(1)

    if (user && user.length >= 1) {
      throw new Error('Username already exists.')
    }

    const password_salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, password_salt)

    await User.create({
      first_name,
      last_name,
      sex,
      username,
      password: password_hash,
      password_salt
    })

    res.message('Successfully created a new user.')
    res.status(201).json({
      message: 'Successfully created a new user.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Updates information about user in the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.edit = async function(req, res) {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      throw new Error('User does not exists.')
    }

    const {
      first_name,
      last_name,
      sex,
      username,
      password
    } = req.body

    const userExists = await User.find({
      username,
      _id: {
        $ne: id
      }
    }).limit(1)

    if (userExists && userExists.length >= 1) {
      throw new Error('Username already exists.')
    }

    user.set({
      first_name,
      last_name,
      sex,
      username
    })

    if (password.length > 0) {
      const password_salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash(password, password_salt)

      user.set({
        password: password_hash,
        password_salt
      })
    }

    await user.save()
    
    res.message('Successfully updated a user.')
    res.status(200).json({
      message: 'Successfully updated a user.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Deletes user from the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.delete = async function(req, res) {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      throw new Error('User does not exists.')
    }

    if (user._id == res.locals.current_user._id) {
      throw new Error('User cannot be deleted because you are currently logged in.')
    }

    await User.deleteOne({ _id: id })

    res.message('Successfully deleted a user.')
    res.status(200).json({
      message: 'Successfully deleted a user.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}