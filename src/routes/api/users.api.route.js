const express = require('express')
const Router = express.Router()

const controller = require('../../controllers/api/users.api.controller')

// Middleware for checking if user is logged in

const axios = require('axios')
const { BASE_URL } = require('../../../config')

Router.use(async (req, res, next) => {
  if (req.header('Referer') == `${BASE_URL}/admin/auth/register`) {
    return next()
  }
  
  try {
    if (!req.cookies.token) {
      throw new Error('Please login your account before proceeding.')
    }

    const { data: { sub } } = await axios.post(`${BASE_URL}/api/auth/verify`, {
      token: req.cookies.token
    })

    res.locals.current_user = sub

    if (!req.cookies.refresh_token) {
      const { data: { token, refresh_token } } = await axios.post(`${BASE_URL}/api/auth/refresh`, { id: sub._id })

      res.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // expires in 7 days
        httpOnly: true
      })
  
      res.cookie('refresh_token', refresh_token, {
        maxAge: 1000 * 60 * 60 * 3, // expires in 3 hours
        httpOnly: true
      })
    }
  }
  catch(err) {
    let error = err.message
    if (err.response) {
      if (err.response.data) {
        error = err.response.data.message || err.message
      }
    }

    res.message(error)
    return res.redirect('/admin/auth')
  }

  next()
})

Router.get('', controller.read)
Router.post('/store', controller.store)
Router.patch('/:id/edit', controller.edit)
Router.delete('/:id/delete', controller.delete)

module.exports = Router