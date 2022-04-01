const { Request, Response } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const SECRET = 'some-secret-stuff-here'

/**
 * Logins user to the system
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.index = async function(req, res) {
  try {
    const {
      username,
      password
    } = req.body

    const user = await User.find({ username }).limit(1)

    if (user && user.length <= 0) {
      throw new Error('Invalid username or password.')
    }

    const compare = await bcrypt.compare(password, user[0].password)

    if (!compare) {
      throw new Error('Invalid username or password.')
    }

    user[0].set({
      password: null,
      password_salt: null
    })

    const token = jwt.sign({
      sub: user[0]
    }, SECRET, {
      expiresIn: '7d'
    })
    
    const refresh_token = jwt.sign({
      sub: Date.now()
    }, SECRET, {
      expiresIn: '3h'
    })

    res.cookie('token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // expires in 7 days
      httpOnly: true
    })

    res.cookie('refresh_token', refresh_token, {
      maxAge: 1000 * 60 * 60 * 3, // expires in 3 hours
      httpOnly: true
    })

    res.status(200).json({
      message: 'ok',
      token,
      refresh_token
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Verifies the token
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.verify = async function(req, res) {
  try {
    const { token } = req.body
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] })

    res.status(200).json({
      message: 'ok',
      sub: decoded.sub
    })
  }
  catch(err) {
    res.status(400).json({
      message: 'Token error: Please login again.'
    })
  }
}

/**
 * Request new tokens
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.refresh = async function(req, res) {
  try {
    const { id } = req.body
    
    const user = await User.findById(id)

    if (!user) {
      throw new Error('User does not exist.')
    }

    user.set({
      password: null,
      password_salt: null
    })

    const token = jwt.sign({
      sub: user
    }, SECRET, {
      expiresIn: '7d'
    })
    
    const refresh_token = jwt.sign({
      sub: Date.now()
    }, SECRET, {
      expiresIn: '3h'
    })

    res.status(200).json({
      message: 'ok',
      token,
      refresh_token
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Logouts user to the system
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.logout = async function(req, res) {
  res.cookie('token', '', {
    maxAge: -1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  })

  res.cookie('refresh_token', '', {
    maxAge: -1000 * 60 * 60 * 3,
    httpOnly: true
  })

  res.redirect('/admin/auth?logout=true')
}